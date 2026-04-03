const express = require('express')
const router = express.Router()
const { getMaterialsByLesson, createMaterial, updateMaterial, deleteMaterial } = require('../controllers/materialController')
const { protect, restrictTo } = require('../moddlewares/auth')

router.get('/lesson/:lessonId', protect, getMaterialsByLesson)
router.post('/', protect, restrictTo('teacher', 'admin'), createMaterial)
router.put('/:id', protect, restrictTo('teacher', 'admin'), updateMaterial)
router.delete('/:id', protect, restrictTo('teacher', 'admin'), deleteMaterial)

module.exports = router
