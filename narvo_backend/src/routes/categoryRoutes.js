const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/categoryController');

// المسارات
router.post('/', categoryCtrl.createCategory); // للإضافة
router.get('/', categoryCtrl.getCategories);   // للجلب

// ضيف دول لو مش موجودين 👇
router.put('/:id', categoryCtrl.updateCategory); 
router.delete('/:id', categoryCtrl.deleteCategory);

module.exports = router;
