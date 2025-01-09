const jwt = require('jsonwebtoken');
const adminSchema = require('../model/adminModel');

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace(`Bearer `, "");
       
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Invalid token' });
        }

        const admin = await adminSchema.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({ message: 'Access denied. Admin not found.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json ({ message: 'Invalid or expired token', error });
    }
}

module.exports = adminAuth;