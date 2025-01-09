const jwt = require('jsonwebtoken');
const userSchema = require('../model/userModel');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. Token not provided!' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userSchema.findOne({ _id: decoded.id });

        if (!user || user.isBlocked || !user.isVerified) {
            return res.status(403).json({ message: 'Invalid user'})
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        
        return res.status(401).json({ message: 'Invalid or expired token!', error });
    }
}

module.exports = verifyToken