const orderSchema = require('../model/orderModel');
const userSchema = require('../model/userModel');
const productSchema = require('../model/productModel');
const HTTP_STATUS = require('../utils/httpStatusCodes');

const getSalesReport = async (req, res) => {
    try {
        const { filter, startDate, endDate } = req.query;

        let dateFilter = {};
        if (filter === 'custom' && startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
                }
            }
        } else if (filter === 'daily') {
            const today = new Date();

            dateFilter = {
                createdAt: {
                    $gte: new Date(today.setHours(0, 0, 0, 0)),
                    $lte: new Date(today.setHours(23, 59, 59, 999)),
                }
            };
        } else if (filter === 'weekly') {
            const today = new Date();

            const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            const lastDayOfWeek = new Date(today.setDate(firstDayOfWeek.getDate() + 6));
            dateFilter = {
                createdAt: {
                    $gte: firstDayOfWeek,
                    $lte: lastDayOfWeek,
                }
            };
        } else if (filter === 'monthly') {
            const today = new Date();

            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            dateFilter = {
                createdAt: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth,
                }
            };
        }

        const dailyReport = await orderSchema.aggregate([
            { $match: {
                ...dateFilter,
                orderStatus: 'Delivered'
            } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSalesCount: { $sum: 1 },
                    totalOrderAmount: { $sum : "$subtotal" },
                    totalDiscounts: { $sum: "$discount" },
                    totalRevenue: { $sum: "$total" },
                }
            }, 
            {
                $sort: { _id: 1 }
            }
        ]);

        const overAllSummary = await orderSchema.aggregate([
            {
                $match: {
                    ...dateFilter,
                    orderStatus: 'Delivered'
                }
            }, 
            {
                $group: {
                    _id: null,
                    totalSalesCount: { $sum: 1 },
                    totalOrderAmount: { $sum : "$subtotal" },
                    totalDiscounts: { $sum: "$discount" },
                    totalRevenue: { $sum: "$total" },
                }
            }
        ]);

        return res.status(HTTP_STATUS.OK).json({ 
            message: 'Sales report fetched successfully!', 
            dailyReport, 
            overAllSummary: overAllSummary.length > 0 ? overAllSummary[0] : {
                totalSalesCount: 0,
                totalDiscounts: 0,
                totalOrderAmount: 0,
                totalRevenue: 0,
            } 
        });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getChartData = async (req, res) => {
    try {
        const { period } = req.query;
    
        const matchCriteria = {
          orderStatus: { $nin: ['Returned', 'Cancelled'] },
        };

        const now = new Date();
    
        const dateRanges = {
            yearly: {
                start: new Date(now.getFullYear() - 9, 0, 1),
                end: new Date(now.getFullYear() + 1, 0, 1),
            },
            monthly: {
                start: new Date(now.getFullYear(), now.getMonth() - 11, 1),
                end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            },
            weekly: {
                start: new Date(now - 7 * 24 * 60 * 60 * 1000),
                end: new Date(),
            }
        };
    
        if (dateRanges[period]) {
          matchCriteria.createdAt = {
            $gte: dateRanges[period].start,
            $lt: dateRanges[period].end,
          };
        }
    
        const groupByFormat = {
          yearly: '%Y', 
          monthly: '%Y-%m', 
          weekly: '%Y-%m-%d', 
        };
    
        const ordersChartData = await orderSchema.aggregate([
          { $match: matchCriteria },
          {
            $group: {
              _id: { $dateToString: { format: groupByFormat[period] || '%Y-%m', date: '$createdAt' } },
              totalSales: { $sum: '$total' },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        const completePeriods = [];
        if (period === 'yearly') {
            for (let i = 9; i >= 0; i--) {
                completePeriods.push((now.getFullYear() - i).toString());
            }
        } else if (period === 'monthly') {
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                completePeriods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
            }
        } else if (period === 'weekly') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now - i * 24 * 60 * 60 * 1000);
                completePeriods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
            }
        }

        const salesDataMap = new Map(ordersChartData.map(item => [item._id, item.totalSales]));

        const transformedData = completePeriods.map(period => ({
          name: period,
          value: salesDataMap.get(period) || 0,
        }));
    
        res.status(HTTP_STATUS.OK).json({
          success: true,
          data: transformedData,
        });
      } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to fetch orders chart data',
          error: error,
        });
      }
};

const getCounts = async (req, res) => {
    try {
        const users = await userSchema.find({ isBlocked: false }).countDocuments();
        const products = await productSchema.find({ isListed: true }).countDocuments();
        const orders = await orderSchema.find().countDocuments();

        return {
            activeUsers: users,
            activeProducts: products,
            totalOrders: orders,
        };
    } catch (error) {
        console.error(error);
        throw error;
        // return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getTopProducts = async (req, res) => {
    try {
        const topSellingProducts = await orderSchema.aggregate([
            {
                $unwind: "$items"
            }, {
                $group: {
                    _id: "$items.product",
                    totalQuantitySold: { $sum: "$items.quantity" },
                }
            }, {
                $sort: { totalQuantitySold: -1 }
            }, {
                $limit: 10
            }, {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            }, {
                $unwind: '$productDetails'
            }, {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    totalQuantitySold: 1,
                    productName: '$productDetails.name',
                    productPrice: '$productDetails.price',
                }
            }
        ]);

        return topSellingProducts ;
    } catch (error) {
        console.error(error);
        throw error;
        // return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getTopCategories = async (req, res) => {
    try {
        const topSellingCategories = await orderSchema.aggregate([
            {
                $unwind: '$items'
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            }, {
                $unwind: '$productDetails'
            }, {
                $group: {
                    _id: '$productDetails.category',
                    totalQuantitySold: { $sum: '$items.quantity' },
                }
            }, {
                $sort: { totalQuantitySold: -1 }
            }, {
                $limit: 10
            }, {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            }, {
                $unwind: '$categoryInfo'
            }, {
                $project: {
                    categoryId: '$_id',
                    categoryName: '$categoryInfo.name',
                    totalQuantitySold: 1,
                }
            }
        ]);

        return topSellingCategories;
        // return res.status(HTTP_STATUS.OK).json({ message: 'Top selling categories fetched successfully!', topSellingCategories });
    } catch (error) {
        console.error(error);
        throw error;
        // return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

const getStats = async (req, res) => {
    try {
        const [counts, topSellingProducts, topSellingCategories] = await Promise.all([
            getCounts(req, res),
            getTopProducts(req, res),
            getTopCategories(req, res)
        ]);

        return res.status(HTTP_STATUS.OK).json({ message: 'Stats fetched!', counts, topSellingProducts, topSellingCategories });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
};

module.exports = {
    getSalesReport,
    getChartData,
    getStats,
}