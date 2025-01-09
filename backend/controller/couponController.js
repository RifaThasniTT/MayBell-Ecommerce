const Coupon = require('../model/couponModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');

const createCoupon = async (req, res) => {
    try {
        const { code, discountAmount, minPurchaseAmount, endDate, usagePerUser } = req.body;

        if (!code || !discountAmount || !endDate) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'All required fields must be filled!' });
        }

        if (discountAmount <= 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Discount amount must be greater than 0!' });
        }

        if (minPurchaseAmount && minPurchaseAmount < 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Minimum purchase amount cannot be negative!' });
        }

        if (new Date(endDate) < new Date()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'End date must be in the future!' });
        }

        const existingCoupon = await Coupon.findOne({ code: { $regex: `^${code}$`, $options: 'i' } });
        if (existingCoupon) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Coupon code already exists!' });
        }
    
        const newCoupon = new Coupon({
            code,
            discountAmount,
            minPurchaseAmount: minPurchaseAmount || 0,
            endDate,
            usagePerUser: usagePerUser || null, // Null indicates no user-specific usage limit
        });

        await newCoupon.save();

        return res.status(HTTP_STATUS.CREATED).json({
            message: 'Coupon created successfully!',
            coupon: newCoupon,
        });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 }); 

        if (!coupons || coupons.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                message: 'No coupons found!',
                coupons: [],
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            message: 'Coupons fetched successfully!',
            coupons,
        });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: 'Server error',
            error,
        });
    }
};

const getApplicableCoupons = async (req, res) => {
    const { cartValue } = req.query;
    const userId = req.user.id;

    try {
        if ( !cartValue || isNaN(cartValue)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Cart value is required and must be a valid number!'
            });
        }

        const applicableCoupons = await Coupon.find({
            isActive: true,
            endDate: { $gte: new Date() },
            minPurchaseAmount: { $lte: cartValue },
        });

        const filteredCoupons = applicableCoupons.filter((coupon) => {
            const userUsage = coupon.usedByUsers.find(
                (usage) => usage.user.toString() === userId
            );

            if (coupon.usagePerUser == null) {
                return true; 
            }

            return !userUsage || (userUsage.usageCount < coupon.usagePerUser);
        });

        if (filteredCoupons.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                message: 'No applicable coupons found for this cart value.',
                coupons: [],
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            message: 'Applicable coupons fetched successfully!',
            coupons: filteredCoupons,
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: 'Server error',
            error
        });
    }
};

const toggleCouponStatus = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Coupon not found!' });
        }

        coupon.isActive = !coupon.isActive;

        await coupon.save();

        return res.status(HTTP_STATUS.OK).json({
            message: `Coupon status has been ${coupon.isActive ? 'activated' : 'deactivated'} successfully!`,
            coupon,
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
}

module.exports = {
    createCoupon,
    getAllCoupons,
    getApplicableCoupons,
    toggleCouponStatus,
};