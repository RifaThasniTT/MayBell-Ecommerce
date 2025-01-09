const Offer = require('../model/offerModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');

const createOffer = async (req, res) => {
    try {
        const { title, type, discountPercentage, maxDiscountAmount, minPurchaseAmount, endDate, applicableProducts, applicableCategories } = req.body;

        if (!title || !type || !endDate) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Title, type and end date is required!' });
        }

        if (endDate < Date.now()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'End date should be a future date.' });
        }

        if (type === 'product' && !applicableProducts) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Applicable products are required for product offers!' });
        }

        if (type === 'category' && !applicableCategories) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Applicable categories are required for category offers!' });
        }

        if (discountPercentage < 0 || discountPercentage > 50) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Discount percentage should be between 0 and 50' });
        }

        if (maxDiscountAmount && maxDiscountAmount < 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Maximum discount amount cannot be negative!' });
        }

        if (minPurchaseAmount && minPurchaseAmount < 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Minimum purchase amount cannot be negative!' });
        }

        const newOffer = new Offer({
            title,
            type,
            discountPercentage: discountPercentage || null,
            maxDiscountAmount: maxDiscountAmount || null,
            minPurchaseAmount: minPurchaseAmount || 0,
            endDate,
            isActive: true,
            applicableCategories: type === 'category' ? applicableCategories : [],
            applicableProducts: type === 'product' ? applicableProducts : [],
        });

        await newOffer.save();

        return res.status(HTTP_STATUS.CREATED).json({ 
            message: 'Offer created successfully!',
            offer: newOffer,
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getOffers = async (req, res) => {
    try {
        const offers = await Offer.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'applicableProducts',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            }, 
            {
                $lookup: {
                    from: 'categories',
                    localField: 'applicableCategories',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            }, 
            {
                $project: {
                    _id: 1,
                    title: 1,
                    type: 1,
                    isActive: 1,
                    discountPercentage: 1,
                    endDate: 1,
                    productDetails: {
                        _id: 1,
                        name: 1,
                    },
                    categoryDetails: {
                        _id: 1, 
                        name: 1,
                    }
                }
            }
        ]);

        if (!offers || offers.length === 0) {
            return res.status(HTTP_STATUS.OK).json({ message: 'No offers found!', offers: [] });
        }

        return res.status(HTTP_STATUS.OK).json({ message: 'Offer created successfully!' , offers });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const toggleOfferStatus = async (req, res) => {
    try {
        const { offerId } = req.params;

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Offer not found!' });
        }

        offer.isActive = !offer.isActive;

        await offer.save();

        return res.status(HTTP_STATUS.OK).json({ message: `Offer status successfully toggled to ${offer.isActive ? 'Active' : 'Inactive'}`, offer });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
}

module.exports = {
    createOffer,
    getOffers,
    toggleOfferStatus,
}