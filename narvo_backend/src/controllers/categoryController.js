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

// تحديث فئة موجودة
exports.updateCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true, runValidators: true } // new عشان يرجع لك البيانات بعد التعديل
    );

    if (!category) {
      return res.status(404).json({ error: 'الفئة غير موجودة' });
    }

    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'فشل تحديث الفئة، قد يكون الاسم مكرراً' });
  }
};

// حذف فئة
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'الفئة غير موجودة' });
    }

    res.json({ success: true, message: 'تم حذف الفئة بنجاح' });
  } catch (err) {
    res.status(400).json({ error: 'حدث خطأ أثناء محاولة الحذف' });
  }
};
