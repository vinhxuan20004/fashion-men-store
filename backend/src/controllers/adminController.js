'use strict';

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalUsers,
      totalProducts,
      revenueResult,
      pendingOrders,
      todayOrders,
      
      // Growth data
      prevRevenueResult,
      prevOrders,
      prevUsers,
      
      // 7-day trend
      sevenDayTrend
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'USER' }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { paymentStatus: 'PAID', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ orderStatus: 'PENDING' }),
      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      
      // Prev period revenue
      Order.aggregate([
        { $match: { paymentStatus: 'PAID', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      // Prev period orders
      Order.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      // Prev period users
      User.countDocuments({ role: 'USER', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      
      // 7-day trend aggregation
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$total', 0] } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const prevRevenue = prevRevenueResult[0]?.totalRevenue || 0;

    // Calculate growth rates
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const revenueGrowth = calculateGrowth(totalRevenue, prevRevenue);
    const ordersGrowth = calculateGrowth(totalOrders, prevOrders);
    const usersGrowth = calculateGrowth(totalUsers, prevUsers);

    // Get lifetime revenue
    const lifetimeRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: lifetimeRevenueResult[0]?.total || 0,
        monthlyRevenue: totalRevenue,
        revenueGrowth,
        totalOrders,
        ordersGrowth,
        totalUsers,
        usersGrowth,
        totalProducts,
        pendingOrders,
        todayOrders,
        sevenDayTrend
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Revenue By Period ────────────────────────────────────────────────────────
const getRevenueByPeriod = async (req, res, next) => {
  try {
    const { period = 'day', year, month } = req.query;
    const currentYear = parseInt(year, 10) || new Date().getFullYear();

    let groupBy;
    let matchFilter = { paymentStatus: 'PAID' };

    if (period === 'day') {
      // Revenue for each day of a specific month
      const currentMonth = parseInt(month, 10) || new Date().getMonth() + 1;
      matchFilter.createdAt = {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      };
      groupBy = { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' }, year: { $year: '$createdAt' } };
    } else if (period === 'month') {
      // Revenue for each month of a specific year
      matchFilter.createdAt = {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1),
      };
      groupBy = { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } };
    } else {
      // Revenue per year (last 5 years)
      const fiveYearsAgo = new Date(new Date().getFullYear() - 4, 0, 1);
      matchFilter.createdAt = { $gte: fiveYearsAgo };
      groupBy = { year: { $year: '$createdAt' } };
    }

    const revenue = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: { period, revenue },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Top Products ─────────────────────────────────────────────────────────────
const getTopProducts = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const products = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(limit)
      .select('name slug images price salePrice soldCount brand category')
      .populate('category', 'name slug')
      .lean({ virtuals: true });

    return res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Order Status Distribution ────────────────────────────────────────────────
const getOrderStatusDistribution = async (req, res, next) => {
  try {
    const distribution = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const allStatuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    const result = allStatuses.map((status) => {
      const found = distribution.find((d) => d._id === status);
      return {
        status,
        count: found ? found.count : 0,
        totalRevenue: found ? found.totalRevenue : 0,
      };
    });

    return res.status(200).json({ success: true, data: { distribution: result } });
  } catch (err) {
    next(err);
  }
};

// ─── Recent Orders ────────────────────────────────────────────────────────────
const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({ success: true, data: { orders } });
  } catch (err) {
    next(err);
  }
};

// ─── Recent Users ─────────────────────────────────────────────────────────────
const getRecentUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'USER' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email phone createdAt isActive avatar')
      .lean();

    return res.status(200).json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
};

// ─── Low Stock Products ───────────────────────────────────────────────────────
const getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold, 10) || 10;

    // Use aggregation to compute totalStock and filter
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          totalStock: { $sum: '$variants.stock' },
        },
      },
      { $match: { totalStock: { $lt: threshold } } },
      { $sort: { totalStock: 1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmpty: true } },
      {
        $project: {
          name: 1,
          slug: 1,
          images: 1,
          price: 1,
          brand: 1,
          totalStock: 1,
          variants: 1,
          'category.name': 1,
          'category.slug': 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, data: { products } });
  } catch (err) {
    next(err);
  }
};

// ─── All Users (Admin) ────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive, role } = req.query;
    const { skip, limit: lim, page: pg } = require('../utils/helpers').paginate(page, limit);

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (role) filter.role = role.toUpperCase();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: pg,
          limit: lim,
          totalPages: Math.ceil(total / lim),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Toggle User Active Status ────────────────────────────────────────────────
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Pending Reviews ──────────────────────────────────────────────────────────
const getPendingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, data: { reviews } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getRevenueByPeriod,
  getTopProducts,
  getOrderStatusDistribution,
  getRecentOrders,
  getRecentUsers,
  getLowStockProducts,
  getAllUsers,
  toggleUserStatus,
  getPendingReviews,
};
