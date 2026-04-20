const { z } = require('zod');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category'); 
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const createProductSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  price: z.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
  oldPrice: z
    .number()
    .positive('Old price must be positive')
    .optional()
    .nullable(),
  stock: z
    .number({ invalid_type_error: 'Stock must be a number' })
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  isActive: z.boolean().optional().default(true),
});

const updateProductSchema = createProductSchema.partial();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
});

// ─── Public Controllers ───────────────────────────────────────────────────────

/**
 * GET /api/products
 * Fetch all active products with pagination and optional filtering
 */
const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, search, minPrice, maxPrice, inStock , category} = paginationSchema.parse(req.query);

  const filter = { isActive: true };

  if (category) {
    const foundCategory = await Category.findOne({ slug: category });
    if (foundCategory) {
      filter.category = foundCategory._id;
    } else {
      // لو بعت قسم مش موجود، رجع داتا فاضية بدل ما ترجع كل حاجة
      return res.status(200).json({ success: true, data: [], pagination: { total: 0 } });
    }
  }

  if (search) {
    filter.$text = { $search: search };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (inStock === true) {
    filter.stock = { $gt: 0 };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .select('-__v'),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * GET /api/products/:id
 * Fetch a single active product by ID
 */
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid product ID.', 400);
  }

  const product = await Product.findOne({ _id: id, isActive: true });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.status(200).json({ success: true, data: product });
});

// ─── Admin Controllers ────────────────────────────────────────────────────────

/**
 * POST /api/admin/products
 * Create a new product
 */
const createProduct = asyncHandler(async (req, res) => {
  const validatedData = createProductSchema.parse(req.body);

  // Validate oldPrice > price if provided
  if (validatedData.oldPrice && validatedData.oldPrice <= validatedData.price) {
    throw new AppError('Old price must be greater than the current price.', 400);
  }

  const product = await Product.create(validatedData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: product,
  });
});

/**
 * PUT /api/admin/products/:id
 * Update an existing product
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. التأكد من الـ ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid product ID.', 400);
  }

  // 2. جلب المنتج الحالي من الداتا بيز (عشان نعرف سعره القديم كام)
  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    throw new AppError('Product not found.', 404);
  }

  // 3. عمل Validation للبيانات اللي جاية
  const validatedData = updateProductSchema.parse(req.body);

  // 4. المقارنة الذكية:
  // بناخد السعر الجديد لو موجود، لو مش موجود بناخد السعر اللي متخزن أصلاً
  const finalPrice = validatedData.price !== undefined ? validatedData.price : existingProduct.price;
  const finalOldPrice = validatedData.oldPrice !== undefined ? validatedData.oldPrice : existingProduct.oldPrice;

  if (finalOldPrice !== null && finalOldPrice <= finalPrice) {
    throw new AppError('Old price must be greater than the current price.', 400);
  }

  // 5. التحديث
  const product = await Product.findByIdAndUpdate(
    id,
    { $set: validatedData },
    { new: true, runValidators: false } // هنخليها false هنا لأننا عملنا الـ validation بنفسنا فوق خلاص
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    data: product,
  });
});
/**
 * DELETE /api/admin/products/:id
 * Soft-delete a product (sets isActive = false)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid product ID.', 400);
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true }
  );

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Product deactivated successfully.',
  });
});

/**
 * GET /api/admin/products
 * Fetch all products (including inactive) for admin management
 */
const adminGetProducts = asyncHandler(async (req, res) => {
  const { page, limit } = paginationSchema.parse(req.query);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adminGetProducts,
};
