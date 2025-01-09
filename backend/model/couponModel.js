const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    }, 
    discountAmount: {
        type: Number,
        required: true,

    },
    minPurchaseAmount: {
        type: Number,
        default: 0,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usagePerUser: {
        type: Number,
        default: null,
    },
    usedByUsers: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            usageCount: { type: Number, default: 0 }
        }
    ]
}, {
    timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);