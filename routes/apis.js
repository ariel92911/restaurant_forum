const express = require('express')
const router = express.Router()

// 引入 multer 並設定上傳資料夾(圖片)
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

//引入controller
const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')
const userController = require('../controllers/api/userController.js')

//後台-餐廳管理
router.get('/admin/restaurants', adminController.getRestaurants)
router.get("/admin/restaurants/:id", adminController.getRestaurant)
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

//後台-餐廳類別管理
router.get("/admin/categories", categoryController.getCategories)
router.post('/admin/categories', categoryController.postCategory)
router.delete("/admin/categories/:id", categoryController.deleteCategory)

// JWT signin
router.post('/signin', userController.signIn)

module.exports = router