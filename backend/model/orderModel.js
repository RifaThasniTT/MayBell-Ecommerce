const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true
            },
        },
    ],
    shippingAddress: {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: /^[0-9]{10,15}$/,
        },
        street: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        zipCode: {
            type: String,
            required: true,
            trim: true,
            match: /^[0-9]{4,10}$/,
        },
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Razorpay', 'Wallet'],
        required: true,
    },
    razorpayOrderId: {
        type: String,
        trim: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending',
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Pending',
    },
    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
    },
    total: {
        type: Number,
        required: true,
    },
    returnReason: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);