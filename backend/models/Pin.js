const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    rank: { type: Number, required: true, index: true }, // ใช้เรียงลำดับ
    logoUrl: { type: String, default: null },
    color: { type: String, default: null }, // optional
}, { timestamps: true });

module.exports = mongoose.model('Pin', pinSchema);
