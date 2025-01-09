const { default: mongoose } = require('mongoose');
const ProductSchema = require('../model/productModel');
const WishlistSchema = require('../model/wishlistModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');

const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        const wishlist = await WishlistSchema.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $project: {
                    _id: 0,
                    productDetails: 1,
                }
            }
        ]);

        if (!wishlist || wishlist.length === 0) {
            return res.status(HTTP_STATUS.OK).json({ message: 'Wishlist is empty!', wishlist: [] });
        }

        return res.status(HTTP_STATUS.OK).json({ message: 'Wishlist fetched successfully!' , wishlist: wishlist[0].productDetails })
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invaid product ID!' });
        }

        const product = await ProductSchema.findById(productId)
        if (!product || !product.isListed) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ messsage: 'Product not found or unavailable' });
        }

        let wishlist = await WishlistSchema.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new WishlistSchema({
                user: userId,
                products: [productId],
            });
        } else {
            if (wishlist.products.includes(productId)) {
                return res.status(HTTP_STATUS.OK).json({ message: 'Product is already in your wishlist!' });
            }

            wishlist.products.push(productId);
        }

        await wishlist.save();

        return res.status(HTTP_STATUS.OK).json({ message: 'Product added to wishlist successfully!' })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Sever error', error }); 
    }
};

const removeProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        let wishlist = await WishlistSchema.findOne({ user: userId });
        if (!wishlist) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Wishlist not found!' });
        }

        const productIndex = wishlist.products.indexOf(productId);
        if (productIndex === -1) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found in the wishlist'})
        }

        wishlist.products.splice(productIndex, 1);

        await wishlist.save();

        return res.status(HTTP_STATUS.OK).json({ message: 'Product is removed from wishlist' });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
}

module.exports = {
    getWishlist,
    addToWishlist,
    removeProduct
}