const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name should not exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description should not exceed 200 characters']
    },
    isListed: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Category', categorySchema);