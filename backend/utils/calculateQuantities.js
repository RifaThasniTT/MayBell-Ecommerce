const CartSchema = require('../model/cartModel');
const WishlistSchema = require('../model/wishlistModel');

const calculateQuantities = async (user) => {
    try {
        const cart = await CartSchema.findOne({ user }).select('items');
        const cartCount = cart ? cart.items.length : 0;

        const wishlist = await WishlistSchema.findOne({ user }).select('products');
        const wishlistCount = wishlist? wishlist.products.length: 0;

        return {
            cartCount, 
            wishlistCount,
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = calculateQuantities;