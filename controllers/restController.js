const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite

const pageLimit = 10

let restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    let whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }
    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => {
      // data for pagination
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      // clean up restaurant data
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLike: req.user.LikeRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll().then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'RestaurantFans' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLike = restaurant.RestaurantFans.map(d => d.id).includes(req.user.id)
      restaurant.increment('viewCounts', { by: 1 })
      return res.render('restaurant', {
        restaurant, isFavorited, isLike
      })
    })
  },

  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render('feeds', {
          restaurants: restaurants,
          comments: comments
        })
      })
    })
  },

  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        Comment,
        { model: db.User, as: 'FavoritedUsers' }
      ]
    }).then(restaurant => {
      let commentCount = restaurant.Comments.length
      let favoritedCount = restaurant.FavoritedUsers.length
      return res.render('dashboard', {
        restaurant, commentCount, favoritedCount
      })
    })
  },

  getTopRestaurants: (req, res) => {
    Restaurant.findAll({ include: [{ model: User, as: 'FavoritedUsers' }] })
      .then(restaurants => {
        restaurants = restaurants.map(rest => ({
          ...rest.dataValues,
          description: rest.dataValues.description.substring(0, 100),
          FavoritedUsersCount: rest.FavoritedUsers.length,
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(rest.id)
        }))

        restaurants = restaurants.sort((a, b) => { return b.FavoritedUsersCount - a.FavoritedUsersCount })

        const topRestaurants = restaurants.slice(0, 10)
        return res.render('topRestaurant', { restaurants: topRestaurants })
      })
  },
}
module.exports = restController
