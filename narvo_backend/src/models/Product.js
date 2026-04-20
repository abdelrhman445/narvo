const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: 'text', // Enable text search
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', 
      required: [true, 'المنتج يجب أن ينتمي لفئة معينة']
    },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length > 0 && arr.length <= 10,
        message: 'Product must have between 1 and 10 images',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be a positive number'],
    },
   oldPrice: {
  type: Number,
  default: null,
  validate: {
    validator: function (v) {
      // 1. لو القيمة فاضية، مفيش مشكلة
      if (v === null || v === undefined) return true;

      // 2. محاولة جلب السعر الحالي من الـ Document أو من الـ Update Query
      const currentPrice = this.price || (this.getUpdate ? this.getUpdate().$set?.price : undefined);

      // 3. لو مش عارفين نوصل للسعر (في حالة الـ Update)، هنعديها للـ Database 
      // ونعتمد على الـ Controller Validation اللي عملناه بـ Zod
      if (currentPrice === undefined) return true;

      return v > currentPrice;
    },
    message: 'Old price must be greater than the current price',
  },
},
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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

// Index for filtering active products efficiently
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
