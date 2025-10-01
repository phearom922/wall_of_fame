// controllers/memberController.js
const Member = require('../models/Member');
const { buildPinRankMap } = require('./pinController'); // 🔥 ใช้ map จาก DB

// Helper
const now = () => new Date();
const getStatus = (endDate) => new Date(endDate) > now() ? 'Active' : 'Expired';

exports.getAllMembers = async (req, res) => {
    const {
        status,
        pin,
        q,
        page = 1,
        limit = 10,
        order = 'asc',
        orderBy = 'pin',
    } = req.query;

    const match = {};
    if (status) {
        if (status.toLowerCase() === 'active') match.endPin = { $gt: now() };
        if (status.toLowerCase() === 'expired') match.endPin = { $lte: now() };
    }
    if (pin) match.pin = pin;
    if (q) {
        const regex = new RegExp(q, 'i');
        match.$or = [{ memberName: regex }, { memberId: regex }];
    }

    // ===== สร้าง pinRank จาก DB =====
    const pinRankMap = await buildPinRankMap();
    const branches = Object.entries(pinRankMap).map(([name, rank]) => ({
        case: { $eq: ['$pin', name] }, then: rank
    }));

    const dir = order.toLowerCase() === 'desc' ? -1 : 1;
    let sortStage;
    if (orderBy === 'pin') {
        sortStage = { pinRank: dir, pinOrder: dir, memberName: 1 };
    } else if (orderBy === 'memberName') {
        sortStage = { memberName: dir };
    } else if (['createdAt', 'startPin', 'endPin'].includes(orderBy)) {
        sortStage = { [orderBy]: dir };
    } else {
        sortStage = { pinRank: 1, pinOrder: 1, memberName: 1 };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
        { $match: match },
        { $addFields: { pinRank: { $switch: { branches, default: 999 } } } },
        { $sort: sortStage },
        {
            $facet: {
                items: [{ $skip: skip }, { $limit: limitNum }],
                total: [{ $count: 'count' }],
            }
        }
    ];

    const result = await Member.aggregate(pipeline);
    const items = result[0]?.items || [];
    const total = result[0]?.total?.[0]?.count || 0;

    const data = items.map((m) => ({ ...m, status: getStatus(m.endPin) }));

    res.json({
        data,
        pagination: {
            page: pageNum, limit: limitNum,
            total, totalPages: Math.ceil(total / limitNum),
        },
    });
};

exports.getMemberById = async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Not found' });
    const status = getStatus(member.endPin);
    res.json({ ...member._doc, status });
};

exports.createMember = async (req, res) => {
    const member = new Member({
        ...req.body,
        imageUrl: req.file?.path || req.body.imageUrl || null,
    });
    await member.save();
    res.status(201).json(member);
};

exports.updateMember = async (req, res) => {
    const update = { ...req.body };
    if (req.file?.path) update.imageUrl = req.file.path;
    const member = await Member.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!member) return res.status(404).json({ message: 'Not found' });
    res.json(member);
};

exports.deleteMember = async (req, res) => {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
};

// GET /api/members/stats
exports.getStats = async (req, res) => {
    const [activeCount, expiredCount, byPin] = await Promise.all([
        Member.countDocuments({ endPin: { $gt: now() } }),
        Member.countDocuments({ endPin: { $lte: now() } }),
        Member.aggregate([
            { $group: { _id: '$pin', count: { $sum: 1 } } },
        ]),
    ]);

    res.json({
        active: activeCount,
        expired: expiredCount,
        pin: byPin.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
    });
};


exports.bulkReorder = async (req, res) => {
    // body: { pin: 'Emerald', items: [{ id, pinOrder }, ...] }
    const { pin, items } = req.body;

    if (!pin || !Array.isArray(items)) {
        return res.status(400).json({ message: 'pin และ items เป็นค่าบังคับ' });
    }

    // ความปลอดภัย: ตรวจสอบว่า document ทั้งหมดมี pin ตรงกัน
    const ids = items.map(i => i.id);
    const docs = await Member.find({ _id: { $in: ids } }, { _id: 1, pin: 1 });
    const mismatched = docs.find(d => d.pin !== pin);
    if (mismatched) {
        return res.status(400).json({ message: 'พบสมาชิกที่ไม่ได้อยู่ใน Pin เดียวกัน' });
    }

    // ทำ bulkWrite เพื่ออัปเดต pinOrder ทีเดียว
    const ops = items.map(i => ({
        updateOne: {
            filter: { _id: i.id },
            update: { $set: { pinOrder: i.pinOrder } },
        }
    }));

    await Member.bulkWrite(ops);
    res.json({ message: 'Reordered', updated: items.length });
};