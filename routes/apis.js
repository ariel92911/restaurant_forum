const express = require('express')
const router = express.Router()

// 引入 multer 並設定上傳資料夾 
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')
const userController = require('../controllers/api/userController.js')

router.get('/admin/restaurants', adminController.getRestaurants)
router.get("/admin/restaurants/:id", adminController.getRestaurant)
router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)


router.get("/admin/categories", categoryController.getCategories)

// JWT signin
router.post('/signin', userController.signIn)

module.exports = router