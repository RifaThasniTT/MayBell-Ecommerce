const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/userAuth');
const userController = require('../controller/userController');
const productController = require('../controller/productController');
const categoryController = require('../controller/categoryController');
const addressController = require('../controller/addressController');
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController');
const wishlistController = require('../controller/wishlistController');
const walletController = require('../controller/walletController');

//Auth 
router.post('/signup', userController.signup);
router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);
router.post('/login', userController.login);
router.post('/google-signin', userController.googleSignIn);
router.post('/forgot-password', userController.forgotPassword);
router.patch('/reset-password', userController.resetPassword);

//Profile
router.get('/quantity', verifyToken, userController.calculateCount);
router.get('/profile', verifyToken, userController.getProfile);
router.patch('/edit-username', verifyToken, userController.editUsername);
router.patch('/change-password', verifyToken, userController.changePassword);

//Address
router.get('/address', verifyToken, addressController.getAddress);
router.post('/address', verifyToken, addressController.addAddress);
router.patch('/address/:addressId', verifyToken, addressController.editAddress);
router.delete('/address/:addressId', verifyToken, addressController.deleteAddress);

//Product
router.get('/product', productController.getProductsForUser);
router.get('/product/:productId', productController.singleProduct);

//Category
router.get('/categories', categoryController.getCategories);

//Cart
router.get('/cart', verifyToken, cartController.getCart);
router.post('/cart', verifyToken, cartController.addToCart);
router.patch('/cart', verifyToken, cartController.updateCartQuantity);
router.patch('/cart/remove', verifyToken, cartController.deleteCartItem);
router.patch('/cart/clear', verifyToken, cartController.clearCart);

//Order
router.post('/orders', verifyToken, orderController.placeOrder);
router.get('/orders', verifyToken, orderController.getUserOrderHistory);
// router.patch('/orders/:orderId', verifyToken, orderController.updateOrderStatus);
router.get('/orders/:orderId', verifyToken, orderController.getOrderDetails);
router.patch('/orders/payment', verifyToken, orderController.updatePaymentStatus);
router.patch('/orders/:orderId', verifyToken, orderController.updateOrderStatus);
router.post('/orders/:orderId/retry', verifyToken, orderController.retryPayment);
router.post('/orders/:orderId/request-return', verifyToken, orderController.returnRequest);

//wishlist
router.get('/wishlist', verifyToken, wishlistController.getWishlist);
router.post('/wishlist', verifyToken, wishlistController.addToWishlist);
router.patch('/wishlist', verifyToken, wishlistController.removeProduct);

//coupon
router.get('/coupons', verifyToken, couponController.getApplicableCoupons);

//wallet
router.get('/wallet', verifyToken, walletController.getWallet);

module.exports = router;