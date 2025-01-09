const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        unique: true,
    }, 
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    isListed: {
        type: Boolean,
        default: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
    },
    images: [{
        type: String,
        required: true,
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);