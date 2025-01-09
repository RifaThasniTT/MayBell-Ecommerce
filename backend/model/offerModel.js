const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    }, 
    type: {
        type: String,
        required: true,
        enum: ['product', 'category'],
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    maxDiscountAmount: {
        type: Number,
        default: null
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
    applicableProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        }
    ],
    applicableCategories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);