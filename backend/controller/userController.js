const UserSchema = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const HTTP_STATUS = require('../utils/httpStatusCodes');
const calculateQuantities = require('../utils/calculateQuantities');

const JWT_SECRET = process.env.JWT_SECRET || 'seecret_keyy';
const SALTROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationEmail = async (email, otp) => {
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            }
        })

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'Verify your Account',
            text: `${otp} is the otp to register your Maybell account. It is valid only for one minute.`
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error('Erroring sending otp: ', error); 
    }
}

const signup = async (req, res) => {
    try {
        
        const { username, email, password } = req.body;

        if (!username.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({
                message: 'All fields are required!'
            });
        }



        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format!"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be atleast 6 characters long!'
            });
        }

        const existingUser = await UserSchema.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email is already registered!'
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);        

        const newUser = new UserSchema ({
            username: username.trim(), 
            email: email.trim(),
            password: hashedPassword,
        });

        const otp = generateOtp();

        newUser.otp = otp;
        newUser.otpExpiry = Date.now() + 1 * 60 * 1000;

        await newUser.save();

        await sendVerificationEmail(email, otp);

        return res.status(201).json({
            message: 'User registered successfully. Please verify your email',
            user: {
                _id: newUser._id,
                name: newUser.username,
                email: newUser.email,
                isVerified: newUser.isVerified,
                isBlocked: newUser.isBlocked,
            },
        })
    } catch (error) {
        console.error(error);
        
        return res.status(500).json({ message: 'Server error', error });
    }
};

const verifyOtp = async (req, res) => {
    try {

        const { email, otp } = req.body;

        const user = await UserSchema.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        } 

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP!' });
        }        

        const updates = {
            isVerified : true,
            otp: null,
            otpExpiry: null,
        };
    
        const updatedUser = await UserSchema.findByIdAndUpdate(
            { _id: user._id },
            {$set: updates},
            {new: true},
        );

        return res.status(200).json({
            message: 'Email verified successfully!',
        })
        
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await UserSchema.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        if (user.otp && user.otpExpiry > Date.now()) {
            return res.status(400).json({ message: 'Please wait before requesting a new OTP.' });
        }

        const otp = generateOtp();

        const updates = {
            otp,
            otpExpiry: Date.now() + 1 * 60 *1000,
        }

        await sendVerificationEmail(email, otp);

        const updatedUser = await UserSchema.findByIdAndUpdate(
            { _id: user._id },
            {$set: updates},
            {new: true},
        );

        return res.status(200).json({ message: 'New otp sent to your email.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error});
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email.trim() && !password.trim()) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format!' });
        }

        const user = await UserSchema.findOne({ email }).select('+password');
        if (!user || user.isBlocked) {
            return res.status(400).json({ message: 'User not found or account is blocked!' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'User not verified! Please verify your account' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password!' });
        }

        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '9h' });

        const { cartCount, wishlistCount } = await calculateQuantities(user._id);

        return res.status(200).json({
            message: 'User login successful',
            user: {
                _id: user._id,
                name: user.username,
                email: user.email,
                isBlocked: user.isBlocked,
                isVerified: user.isVerified,
            },
            token,
            cartCount,
            wishlistCount,
        })
        
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const googleSignIn = async (req, res) => {
    try {
        const { uid, name, email } = req.body;

        let user = await UserSchema.findOne({ email });

        if (user) {
            const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, {expiresIn: '8h'});

            const { cartCount, wishlistCount } = await calculateQuantities(user._id);

            return res.status(200).json({
                message: 'User logged in successfully!',
                user: {
                    username: user.username,
                    email: user.email
                },
                token,
                cartCount,
                wishlistCount
            });
        } else {
            const newUser = new UserSchema({
                googleID: uid,
                username: name,
                email,
                isVerified: true,
            });
         
            await newUser.save();

            const token = jwt.sign({ id: newUser._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '8h' });

            const { cartCount, wishlistCount } = await calculateQuantities(newUser._id);

            return res.status(201).json({
                message: 'New user registered and logged in',
                user: {
                    googleID: newUser.googleID,
                    username: newUser.username,
                    email: newUser.email,
                },
                token,
                cartCount,
                wishlistCount
            });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Email is required!" });
        }

        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found!' });
        }

        const otp = generateOtp();

        user.otp = otp;
        user.otpExpiry = Date.now() + 1 * 60 * 1000;

        await user.save();

        await sendVerificationEmail(email, otp);

        return res.status(HTTP_STATUS.OK).json({
            message: "Otp send to your email.",
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found!' });
        }

        return res.status(HTTP_STATUS.OK).json({ message: "User details fetched", user });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const editUsername = async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.user.id;

        if (!username.trim()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Username is required!' });
        }

        const user = await UserSchema.findByIdAndUpdate(userId, { username }, { new: true });

        if (user) {
            return res.status(HTTP_STATUS.OK).json({
                message: "Username updated successfully!",
                user
            });
        } else {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found!' });
        }
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!newPassword.trim() || newPassword.length < 6) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Password must be atleast 6 characters long!' });
        }

        const user = await UserSchema.findById(userId).select('+password');

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found!' });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Entered current password is incorrect!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALTROUNDS);

        user.password = hashedPassword;
        await user.save();

        return res.status(HTTP_STATUS.OK).json({ message: "Password changed successfully!" });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password.trim()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Email and password is required!' });
        }

        const user = await UserSchema.findOne({ email }).select('+password');
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found!' });
        }

        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);
        user.password = hashedPassword;

        await user.save();

        return res.status(HTTP_STATUS.OK).json({ message: 'Password reset successfully!' });

    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }    
};

const calculateCount = async (req, res) => {
    try {

        const userId = req.user.id;

        const { cartCount, wishlistCount } = await calculateQuantities(userId);

        return res.status(HTTP_STATUS.OK).json({ cartCount, wishlistCount });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

module.exports = {
    signup,
    verifyOtp,
    login,
    resendOtp,
    googleSignIn,
    forgotPassword,
    getProfile,
    editUsername,
    changePassword,
    resetPassword,
    calculateCount
}