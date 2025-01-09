const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: function () {
                return !this.googleID;
            },
            select: false,
        },
        googleID: {
            type: String,
            unique: true,
            sparse: true,
        }, 
        isBlocked: {
            type: Boolean,
            default: false,
        },
        profileImage: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        }
    },  
    {    
        timestamps: true,
    }
);

module.exports = mongoose.model('users', userSchema);