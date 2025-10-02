const mongoose = require('mongoose');

const PIN_ENUM = [
    'Crown Diamond',
    'Black Diamond',
    'Blue Diamond',
    'Diamond',
    'Emerald',
    'Sapphire',
    'Ruby',
    'Pearl',
    'Platinum',
    'Gold',
    'Silver',
    'Bronze',
];

const memberSchema = new mongoose.Schema({
    memberId: { type: String, required: true, unique: true },
    memberName: { type: String, required: true },
    pin: { type: String, enum: PIN_ENUM, required: true },
    pinOrder: { type: Number, default: 0 },       // 🔥 ลำดับภายใน Pin
    startPin: { type: Date, required: true },
    endPin: { type: Date, required: true },
    imageUrl: { type: String },
    enabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
module.exports.PIN_ENUM = PIN_ENUM;
