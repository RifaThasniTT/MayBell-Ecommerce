const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const adminAuth = require('../middleware/adminAuth');
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');
const orderController = require('../controller/orderController');
const offerController = require('../controller/offerController');
const couponController = require('../controller/couponController');
const upload = require('../middleware/uploadImage');
const salesController = require('../controller/salesController');

//Authentication
router.post('/login', adminController.login);

//User Management
router.get('/users', adminAuth, adminController.getUsers);
router.patch('/users/:userId/block', adminAuth, adminController.toggleBlockUser);

//Category Management
router.get('/categories', adminAuth, categoryController.getCategories);
router.post('/categories', adminAuth, categoryController.addCategory);
router.patch('/categories/:categoryId', adminAuth, categoryController.editCategory);
router.patch('/categories/:categoryId/list', adminAuth, categoryController.toggleStatus);

//ProductManagement
router.get('/products', adminAuth, productController.getAllProducts);
router.post('/products', adminAuth, upload.array('images', 4), productController.addProduct);
router.patch('/products/:productId/list', adminAuth, productController.toggleStatus);
router.patch('/products/:productId', adminAuth, upload.array('newImages', 4), productController.editProduct);

//Order Management
router.get('/orders', adminAuth, orderController.getAllOrders);
router.patch('/orders/:orderId', adminAuth, orderController.updateOrderStatus);

//Sales management
router.get('/orders/sales', adminAuth, salesController.getSalesReport);
router.get('/orders/chart', adminAuth, salesController.getChartData);
router.get('/orders/stats', adminAuth, salesController.getStats);

//Offer Management
router.post('/offers', adminAuth, offerController.createOffer);
router.get('/offers', adminAuth, offerController.getOffers);
router.patch('/offers/:offerId', adminAuth, offerController.toggleOfferStatus);

//Coupon Management
router.post('/coupons', adminAuth, couponController.createCoupon);
router.get('/coupons', adminAuth, couponController.getAllCoupons);
router.patch('/coupons/:couponId', adminAuth, couponController.toggleCouponStatus);

module.exports = router;