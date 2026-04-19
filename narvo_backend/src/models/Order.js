const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: [0.01, 'Price must be a positive number'],
    },
  },
  { _id: false }
);

const shippingDetailsSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, 'Shipping address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9+\-\s()]{7,20}$/, 'Please provide a valid phone number'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Critical for IDOR-safe queries
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0.01, 'Total amount must be positive'],
    },
    shippingDetails: {
      type: shippingDetailsSchema,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for IDOR-safe user order queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
