const { z } = require('zod');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), {
          message: 'Invalid product ID',
        }),
        quantity: z
          .number({ invalid_type_error: 'Quantity must be a number' })
          .int('Quantity must be an integer')
          .min(1, 'Quantity must be at least 1')
          .max(100, 'Cannot order more than 100 of a single item'),
      })
    )
    .min(1, 'Order must contain at least one item')
    .max(20, 'Cannot order more than 20 different products at once'),
  shippingDetails: z.object({
    address: z.string().min(5, 'Address is too short').max(500),
    phone: z
      .string()
      .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid phone number format'),
    city: z.string().min(2, 'City name is too short').max(100),
  }),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z
    .enum(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'])
    .optional(),
});

// ─── User Controllers ─────────────────────────────────────────────────────────

/**
 * POST /api/orders/checkout
 * Protected: requireAuth
 *
 * Creates a Cash-on-Delivery order.
 * Uses atomic stock deduction with $inc to prevent race conditions.
 * IDOR Prevention: userId is taken from req.user.id (from JWT), NEVER from body.
 */
const checkout = asyncHandler(async (req, res) => {
  // 1. Validate body
  const { items, shippingDetails } = checkoutSchema.parse(req.body);

  // 2. Prevent duplicate productIds in same order
  const productIds = items.map((i) => i.productId);
  if (new Set(productIds).size !== productIds.length) {
    throw new AppError('Duplicate products in order. Merge quantities instead.', 400);
  }

  // 3. Fetch all products in one query
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  if (products.length !== productIds.length) {
    throw new AppError('One or more products were not found or are no longer available.', 400);
  }

  // 4. Build product map for O(1) lookups
  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  // 5. Validate stock and build order items
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = productMap[item.productId];

    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.title}". Available: ${product.stock}`,
        400
      );
    }

    orderItems.push({
      productId: product._id,
      quantity: item.quantity,
      priceAtPurchase: product.price, // Lock price at purchase time
    });

    totalAmount += product.price * item.quantity;
  }

  // 6. Use a MongoDB session for atomic stock deduction + order creation
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      // Atomically deduct stock — prevents overselling in concurrent requests
      for (const item of items) {
        const result = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            stock: { $gte: item.quantity }, // Ensure stock still available
          },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );

        if (!result) {
          throw new AppError(
            `Stock for product "${productMap[item.productId].title}" is no longer sufficient.`,
            400
          );
        }
      }

      // Create the order
      [order] = await Order.create(
        [
          {
            userId: req.user.id, // ← From JWT, never from body (IDOR prevention)
            items: orderItems,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            shippingDetails,
            status: 'Pending',
            statusHistory: [{ status: 'Pending' }],
          },
        ],
        { session }
      );
    });
  } finally {
    session.endSession();
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: {
      orderId: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      itemsCount: order.items.length,
    },
  });
});

/**
 * GET /api/orders/me
 * Protected: requireAuth
 *
 * Fetch orders belonging to the authenticated user ONLY.
 * IDOR Protection: Query ALWAYS filters by req.user.id from JWT.
 * An attacker providing another user's ID in query/body is ignored.
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = paginationSchema.parse(req.query);
  const skip = (page - 1) * limit;

  // CRITICAL: userId is always from the verified JWT — never from req.query or req.body
  const filter = { userId: req.user.id };

  if (status) {
    filter.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.productId', 'title images price'),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─── Admin Controllers ────────────────────────────────────────────────────────

/**
 * GET /api/admin/orders
 * Admin: view all orders with optional status filter and pagination
 */
const adminGetOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = paginationSchema.parse(req.query);
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('items.productId', 'title price'),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * PUT /api/admin/orders/:id
 * Admin: update order status.
 * Auto-creates an 'IN' Transaction when status changes to 'Delivered'.
 */
const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid order ID.', 400);
  }

  const { status } = updateOrderStatusSchema.parse(req.body);

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  // Prevent invalid status transitions
  const statusFlow = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered', 'Cancelled'],
    Delivered: [],
    Cancelled: [],
  };

  if (!statusFlow[order.status].includes(status)) {
    throw new AppError(
      `Cannot transition order from "${order.status}" to "${status}".`,
      400
    );
  }

  const previousStatus = order.status;
  order.status = status;
  order.statusHistory.push({ status, changedBy: req.admin.id });

  await order.save();

  // Auto-ledger: Create an 'IN' transaction when order is Delivered
  if (status === 'Delivered' && previousStatus !== 'Delivered') {
    await Transaction.create({
      type: 'IN',
      amount: order.totalAmount,
      referenceId: order._id,
      referenceModel: 'Order',
      note: `Payment received for Order #${order._id}`,
      createdBy: req.admin.id,
    });
  }

  // Restore stock if order is Cancelled
  if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to "${status}".`,
    data: {
      orderId: order._id,
      previousStatus,
      currentStatus: order.status,
    },
  });
});

module.exports = {
  checkout,
  getMyOrders,
  adminGetOrders,
  adminUpdateOrderStatus,
};
