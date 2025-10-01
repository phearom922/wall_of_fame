const Pin = require('../models/Pin');
const Member = require('../models/Member');

// GET /api/pins (public)
exports.listPins = async (req, res) => {
    const pins = await Pin.find().sort({ rank: 1 });
    res.json(pins);
};

// GET /api/pins/:id (public)
exports.getPin = async (req, res) => {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ message: 'Not found' });
    res.json(pin);
};

// POST /api/pins (admin) - body: {name, rank, color?}, file: logo
exports.createPin = async (req, res) => {
    const { name, rank, color } = req.body;
    const logoUrl = req.file?.path || null;

    const exists = await Pin.findOne({ name });
    if (exists) return res.status(409).json({ message: 'Pin name already exists' });

    const pin = new Pin({ name, rank, color: color || null, logoUrl });
    await pin.save();
    res.status(201).json(pin);
};

// PUT /api/pins/:id (admin) - สามารถอัปโหลดโลโก้ใหม่ได้
exports.updatePin = async (req, res) => {
    const { name, rank, color } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (rank !== undefined) update.rank = Number(rank);
    if (color !== undefined) update.color = color || null;
    if (req.file?.path) update.logoUrl = req.file.path;

    // ชื่อซ้ำ?
    if (update.name) {
        const dup = await Pin.findOne({ name: update.name, _id: { $ne: req.params.id } });
        if (dup) return res.status(409).json({ message: 'Pin name already exists' });
    }

    const pin = await Pin.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!pin) return res.status(404).json({ message: 'Not found' });
    res.json(pin);
};

// DELETE /api/pins/:id (admin) - หมายเหตุ: ไม่ลบ Member ใด ๆ
exports.deletePin = async (req, res) => {
    await Pin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
};

// PUT /api/pins/reorder (admin) - body: { items: [{id, rank}] }
exports.reorderPins = async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' });

    const ops = items.map(i => ({
        updateOne: { filter: { _id: i.id }, update: { $set: { rank: Number(i.rank) } } }
    }));
    await Pin.bulkWrite(ops);
    res.json({ message: 'Reordered', updated: items.length });
};

/**
 * Helper: ดึง map ของ {pinName -> rank} จาก DB
 * ใช้โดย members controller เพื่อเรียงตาม rank ล่าสุด
 */
exports.buildPinRankMap = async () => {
    const pins = await Pin.find({}, { name: 1, rank: 1 });
    const map = {};
    pins.sort((a, b) => a.rank - b.rank).forEach(p => { map[p.name] = p.rank; });
    return map;
};
