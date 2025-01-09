const cartSchema = require('../model/cartModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');
const productSchema = require('../model/productModel');
const calculateCartTotals = require('../utils/calculateCartTotals');

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await cartSchema.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(HTTP_STATUS.OK).json({ message: 'Cart is empty', cart: { items: [], subtotal: 0, total: 0 } });
        }

        const { subtotal, shipping, total } = calculateCartTotals(cart);

        cart.subtotal = subtotal;
        cart.total = total;
        await cart.save();

        return res.status(HTTP_STATUS.OK).json({ message: 'Cart fetched succesfully!', cart: {
            items: cart.items,
            subtotal,
            shipping,
            total,
        } });

    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const product = await productSchema.findById(productId);
        if (!product || !product.isListed) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found or unavaliable' });
        }

        if (quantity > product.stock) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Requested quantity exceeds available stock' });
        }
        if (quantity > 5) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'You can only add up to 5 units of this product to the cart at a time' });
        }

        let cart = await cartSchema.findOne({ user: userId });
        if (!cart) {
            cart = new cartSchema({
                user: userId,
                items: [{ product: productId, quantity }],
            });
        } else {
            const productIndex= cart.items.findIndex(item => item.product.toString() === productId);
            if (productIndex > -1) {

                const newQuantity = cart.items[productIndex].quantity + quantity;
                if (newQuantity > product.stock) {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Total quantity in cart exceeds available stock' });
                }
                if (newQuantity > 5) {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Total quantity in cart exceeds the limit of 5 per product' });
                }

                cart.items[productIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        };

        await cart.populate('items.product');
        const { subtotal, shipping, total } = calculateCartTotals(cart);

        cart.subtotal = subtotal;
        cart.total = total;

        await cart.save();
        return res.status(HTTP_STATUS.OK).json({ message: 'Product added to cart successfully' });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        const product = await productSchema.findById(productId);
        if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found or unavailable' });
        }

        if (quantity > product.stock) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Requested quantity exceeds available stock' });
        }
        if (quantity > 5) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'You can only add up to 5 units of this product to the cart at a time' });
        }

        let cart = await cartSchema.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Cart not found!' });
        }

        const productIndex = cart.items.findIndex(item => item.product._id.toString() === productId.toString());
        if (productIndex === -1) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found in the cart!' });
        }

        cart.items[productIndex].quantity = quantity;

        const { subtotal, shipping, total } = calculateCartTotals(cart);

        cart.subtotal = subtotal;
        cart.total = total;

        await cart.save();
        return res.status(HTTP_STATUS.OK).json({ message: 'Cart updated successfully!', cart });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error })
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        let cart = await cartSchema.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Cart not found!' });
        }

        const productIndex = cart.items.findIndex(item => item.product._id.toString() === productId.toString());
        if (productIndex === -1) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found in the cart!' });
        }

        cart.items.splice(productIndex, 1);

        const { subtotal, shipping, total } = calculateCartTotals(cart);

        cart.subtotal = subtotal;
        cart.total = total;

        await cart.save();
        return res.status(HTTP_STATUS.OK).json({ message: 'Product removed from the cart!', cart });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        let cart = await cartSchema.findOne({ user: userId });
        if (!cart) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Cart not found' });
        }

        cart.items = [];
        cart.subtotal = 0;
        cart.total = 0;

        await cart.save();
        return res.status(HTTP_STATUS.OK).json({ message: 'Cart cleared successfully!', cart });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartQuantity,
    deleteCartItem,
    clearCart
}