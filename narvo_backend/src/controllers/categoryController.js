const Category = require('../models/Category');

// إضافة فئة جديدة
exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: 'الفئة موجودة مسبقاً أو بيانات خاطئة' });
  }
};

// جلب كل الفئات
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
};