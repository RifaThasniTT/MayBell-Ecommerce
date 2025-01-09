const orderSchema = require('../model/orderModel');
const cartSchema = require('../model/cartModel');
const productSchema = require('../model/productModel');
const couponSchema = require('../model/couponModel');
const walletSchema = require('../model/walletModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');
const Razorpay = require('razorpay');
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod, couponCode } = req.body;

        const cart = await cartSchema.findOne({ user: userId }).populate('items.product', 'discountPrice');

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Order items are required!' });
        }

        const items = cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.discountPrice,
        }));

        for (const item of items) {
            const product = await productSchema.findById(item.product);
            if (!product || !product.isListed) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ message: `Product with ID ${item.product} not found!` });
            }
            if (product.stock < item.quantity) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: `Insufficient stock for product: ${product.name}` })
            }
        }

        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let discount = 0;

        //Coupon handling
        if (couponCode) {
            const coupon = await couponSchema.findOne({ code: couponCode, isActive: true });

            if (!coupon) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid or inactive coupon!' });
            }

            if (coupon.endDate < new Date()) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Coupon has expired!' });
            }

            if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: `Min Purchase amount for this coupon is ${coupon.minPurchaseAmount}` });
            }

            const userUsage = coupon.usedByUsers.find((usage) => usage.user.toString() === userId.toString());
            if (userUsage && userUsage.usageCount >= coupon.usagePerUser) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Coupon usage limit exceeded!' });
            }

            discount = coupon.discountAmount;

            if (userUsage) {
                userUsage.usageCount +=1;
            } else {
                coupon.usedByUsers.push({ user: userId, usageCount: 1 });
            }

            await coupon.save();
        } 

        const total = subtotal - discount + 100;

        //Razorpay Payment handling
        let razorpayOrder;
        if (paymentMethod === 'Razorpay') {
            const options = {
                amount: total * 100,
                currency: 'INR',
                receipt: `order_rcptid_${Math.random()}`,
            };

            razorpayOrder = await razorpay.orders.create(options);
        }

        let paymentStatus = 'Pending';
        //Wallet Payment handling
        if (paymentMethod === 'Wallet') {
            const wallet = await walletSchema.findOne({ userId });

            if (!wallet || wallet.balance < total) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Insufficient wallet balance!' });
            }

            wallet.balance -= total;
            wallet.transactions.push({
                type: 'debit',
                amount: total,
                description: `Payment for order placed on ${new Date().toLocaleString()}`,
            });

            await wallet.save();
            paymentStatus = 'Paid'
        }

        const newOrder = new orderSchema({
            user: userId,
            items,
            shippingAddress,
            paymentMethod,
            paymentStatus,
            subtotal,
            discount,
            total,
            razorpayOrderId: razorpayOrder?.id
        });

        const savedOrder = await newOrder.save();

        for (const item of items) {
            await productSchema.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
        }

        return res.status(HTTP_STATUS.CREATED).json({
            message: 'Order placed sucessfully!',
            order: savedOrder,
        });
    } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
        if (!validStatuses.includes(status)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid order status' });
        };

        const order = await orderSchema.findById(orderId).populate('items.product');
        if (!order) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Order not found!' });
        }

        //Cancel and return handlinng
        if ((status === 'Cancelled' || status === 'Returned') && order.orderStatus !== status) {
          
            //Quantity updation
            for (const item of order.items) {
                await productSchema.findByIdAndUpdate(
                    item.product._id,
                    { $inc: { stock: item.quantity } }
                );
            }

            if (order.paymentStatus === 'Paid'){
                if (status === 'Returned' || order.paymentMethod !== 'COD') {
                    const userId = order.user;
                    let wallet = await walletSchema.findOne({ userId });
    
                    if (!wallet) {
                        wallet = new walletSchema({
                            userId,
                            balance: order.total,
                            transactions: [{
                                type: 'credit',
                                amount: order.total,
                                description: `Refunded for ${status.toLowerCase()} order ${order._id}`
                            }]
                        });
                    } else {
                        wallet.balance += order.total;
                        wallet.transactions.push({
                            type: 'credit',
                            amount: order.total,
                            description: `Refunded for ${status.toLowerCase()} order ${order._id}`
                        });
                    }
    
                    await wallet.save();
                }
            }

            const paymentStatus = (order.paymentMethod !== 'COD' && status === 'Returned' && order.paymentStatus !== 'Pending') ? 'Refunded' : order.paymentStatus;

            const updatedOrder = await orderSchema.findByIdAndUpdate(
                orderId,
                {
                    orderStatus: status,
                    paymentStatus: paymentStatus
                },
                { new: true },
            );

            return res.status(HTTP_STATUS.OK).json({ message: 'Order status and payment staus updated successfully!', order: updatedOrder });
        }

        //Delivered handling
        if (status === 'Delivered') {
            let updates = { orderStatus: status };

            if (order.paymentMethod === 'Razorpay' && order.paymentStatus === 'Pending') {
                updates.paymentMethod = 'COD';
                updates.paymentStatus = 'Paid';
            } else if (order.paymentMethod === 'COD') {
                updates.paymentStatus = 'Paid';
            }

            const updatedOrder = await orderSchema.findByIdAndUpdate(orderId, updates, { new: true });

            return res.status(HTTP_STATUS.OK).json({ message: 'Order status updated successfully!', order: updatedOrder });
        }

        const updatedOrder = await orderSchema.findByIdAndUpdate(
            orderId,
            { orderStatus: status },
            { new: true }
        );

        return res.status(HTTP_STATUS.OK).json({ message: 'Order status updated successfully!', order: updatedOrder });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderSchema.find({}).populate('user', 'username email').populate('items.product', 'name').sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'No orders found!' });
        }

        return res.status(HTTP_STATUS.OK).json({ message: 'All orderes fetched!', orders });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getUserOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await orderSchema.find({ user: userId }).populate('items.product', 'name').sort({ createdAt: -1 });
        
        if (!orders || orders.length === 0) {
            return res.status(HTTP_STATUS.OK).json({ message: 'No order history found!', orders: [] });
        }

        return res.status(HTTP_STATUS.OK).json({ message: 'Order history fetched!', orders });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderSchema.findById(orderId).populate('items.product', 'name images');

        if (!order) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Order not found!' });
        }

        return res.status(HTTP_STATUS.OK).json({ message: 'Order details fetched successfully!', order });
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId, razorpayOrderId } = req.body;

        if (!orderId || !razorpayOrderId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid request data!' });
        }        

        const order = await orderSchema.findById(orderId);

        if (!order) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Order not found!' });
        }

        order.paymentStatus = 'Paid';
        order.razorpayOrderId = razorpayOrderId;
        await order.save();

        return res.status(HTTP_STATUS.OK).json({ message: 'Payment status updated successfully!' });
    } catch (error) {
        console.error('updatePaymentStatus', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server errror', error });
    }
};

const retryPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await orderSchema.findById(orderId);

        if (!order) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Order not found!' });
        }
        
        if (order.paymentStatus === 'Paid') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Order is already paid!' });
        }

        const options = {
            amount: order.total * 100,
            currency: 'INR',
            receipt: `retry_rcptid_${Math.random()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(HTTP_STATUS.OK).json({
            message: 'Payment retrying..',
            razorpayOrderId: razorpayOrder.id,
            amount: order.total,
        });
    } catch (error) {
        console.error('retryPayment error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

const returnRequest = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { reason } = req.body;

        const order = await orderSchema.findById(orderId);
        if (!order || order.orderStatus !== 'Delivered') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Return request is only available for delivered orders!' });
        }

        order.returnReason = reason;
        await order.save();
        
        return res.status(HTTP_STATUS.OK).json({ message: 'Return requested successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
}

module.exports = {
    placeOrder,
    updateOrderStatus,
    getAllOrders,
    getOrderDetails,
    getUserOrderHistory,
    updatePaymentStatus,
    retryPayment,
    returnRequest,
}