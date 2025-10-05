// controllers/memberController.js
const Member = require('../models/Member');
const { buildPinRankMap } = require('./pinController'); // 🔥 ใช้ map จาก DB

// Helper
const now = () => new Date();
const getStatus = (endDate) => new Date(endDate) > now() ? 'Active' : 'Expired';

// helper
const toDateOrBad = (v, field) => {
    if (!v) return undefined;
    const d = new Date(v);
    if (isNaN(d.getTime())) {
        const err = new Error(`${field} is invalid date`);
        err.status = 400;
        throw err;
    }
    return d;
};

exports.getAllMembers = async (req, res) => {
    const {
        status,
        pin,
        q,
        enabled,
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
    if (enabled !== undefined) match.enabled = enabled === 'true';
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
    try {
        // รับได้จาก multipart/form-data (multer) เสมอ
        const { memberId, memberName, pin, startPin, endPin, pinOrder, enabled } = req.body;

        // validate ขั้นพื้นฐาน
        if (!memberId || !memberName || !pin || !startPin || !endPin) {
            return res.status(400).json({ message: 'memberId, memberName, pin, startPin, endPin are required' });
        }

        // แปลงชนิด
        const doc = {
            memberId: String(memberId).trim(),
            memberName: String(memberName).trim(),
            pin: String(pin).trim(),
            startPin: toDateOrBad(startPin, 'startPin'),
            endPin: toDateOrBad(endPin, 'endPin'),
            pinOrder: Number(pinOrder ?? 0) || 0,
            enabled: String(enabled ?? 'true') === 'true',
        };

        // แนบรูปถ้ามี upload
        if (req.file?.path) doc.imageUrl = req.file.path;

        const created = await Member.create(doc);
        return res.status(201).json(created);
    } catch (err) {
        // duplicate key (memberId ซ้ำ)
        if (err?.code === 11000) {
            return res.status(409).json({ message: 'memberId already exists' });
        }
        const status = err.status || 500;
        console.error('createMember error:', err);
        return res.status(status).json({ message: err.message || 'Create failed' });
    }
};

// controllers/memberController.js (เฉพาะฟังก์ชันนี้)
exports.updateMember = async (req, res) => {
    try {
        // Validate request
        if (!req.params.id) {
            return res.status(400).json({ message: 'Member ID is required' });
        }

        // ✅ อนุญาตแก้เฉพาะฟิลด์เหล่านี้เท่านั้น
        const ALLOWED = ['memberName', 'pin', 'pinOrder', 'startPin', 'endPin', 'enabled', 'imageUrl'];

        const body = req.body || {};
        const update = {};

        for (const k of ALLOWED) {
            if (body[k] !== undefined) update[k] = body[k];
        }

        // ✅ Coerce ชนิดข้อมูลให้ถูกต้อง
        if (update.startPin) {
            const d = new Date(update.startPin);
            if (isNaN(d.getTime())) return res.status(400).json({ message: 'startPin is invalid date' });
            update.startPin = d;
        }
        if (update.endPin) {
            const d = new Date(update.endPin);
            if (isNaN(d.getTime())) return res.status(400).json({ message: 'endPin is invalid date' });
            update.endPin = d;
        }
        if (update.pinOrder !== undefined) update.pinOrder = Number(update.pinOrder) || 0;
        if (update.enabled !== undefined) update.enabled = String(update.enabled) === 'true' || update.enabled === true;

        // ✅ ถ้ามีอัพไฟล์ใหม่ (Cloudinary via multer), ใช้ไฟล์ใหม่นี้
        if (req.file?.path) update.imageUrl = req.file.path;

        // ❌ ไม่ให้แก้ memberId
        if ('memberId' in update) delete update.memberId;

        const member = await Member.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        });
        if (!member) return res.status(404).json({ message: 'Member not found' });

        res.json(member);
    } catch (err) {
        console.error('updateMember error:', err);
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
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

exports.toggleMember = async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.enabled = !member.enabled;
    await member.save();

    res.json({ message: `Member ${member.enabled ? 'enabled' : 'disabled'}`, member });
};