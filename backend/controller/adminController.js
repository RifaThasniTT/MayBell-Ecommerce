const adminSchema = require('../model/adminModel');
const userSchema = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { use } = require('../routes/adminRoutes');

// const JWT_SECRET = process.env.JWT_SECRET || 'seecret_keyy';
const SALTROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email.trim() && !password.trim()) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format!' });
        }

        const admin = await adminSchema.findOne({ email });

        if (!admin) {
            return res.status(400).json({message: 'Admin does not exist!' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json({message: 'Invalid email or password!' });
        }

        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.status(200).json({
            message: 'Login successful',
            admin: {
                id: admin._id,
                email: admin.email,
            },
            token
        })
        
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const getUsers = async (req, res) => {
    try {

        const users = await userSchema.find({});

        res.status(200).json({
            message: 'User details fetched successfully',
            users
        });
        
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

const toggleBlockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userSchema.findById(userId);

        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        return res.status(200).json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` , user });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    login,
    getUsers,
    toggleBlockUser,
}