const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/categoryController');

// المسارات
router.post('/', categoryCtrl.createCategory); // للإضافة
router.get('/', categoryCtrl.getCategories);   // للجلب

module.exports = router;