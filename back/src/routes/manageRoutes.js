const express = require('express')
const router = express.Router()
const {
  getUsers, createUser, updateUser, deleteUser,
  getGroups, updateGroup
} = require('../controllers/manageController')
const { protect, restrictTo } = require('../moddlewares/auth')

router.use(protect, restrictTo('teacher', 'admin'))

router.get('/users', getUsers)
router.post('/users', restrictTo('admin'), createUser)
router.put('/users/:id', restrictTo('admin'), updateUser)
router.delete('/users/:id', restrictTo('admin'), deleteUser)

router.get('/groups', getGroups)
router.put('/groups/:id', restrictTo('admin'), updateGroup)

module.exports = router
