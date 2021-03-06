const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

// 引入 multer 並設定上傳資料夾(圖片)
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

//引入controller
const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController.js')
const userController = require('../controllers/api/userController.js')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

//後台-餐廳管理
router.get('/admin', authenticated, authenticatedAdmin, (req, res) => res.redirect('/api/admin/restaurants'))
router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get("/admin/restaurants/:id", authenticated, authenticatedAdmin, adminController.getRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)

//後台-餐廳類別管理
router.get("/admin/categories", authenticated, authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticated, authenticatedAdmin, categoryController.postCategory)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategory)
router.delete("/admin/categories/:id", authenticated, authenticatedAdmin, categoryController.deleteCategory)

//後台-使用者權限管理
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.editUsers)
router.put('/admin/users/:id', authenticated, authenticatedAdmin, adminController.putUsers)

//使用者
router.get('/users/top', authenticated, userController.getTopUser)
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

// JWT signin
router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)

module.exports = router