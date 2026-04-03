const express = require('express')
const router = express.Router()
const { getLessonGrades, setBulkGrades, getStudentGrades, getGroupGrades } = require('../controllers/gradeController')
const { protect, restrictTo } = require('../moddlewares/auth')

router.get('/my', protect, restrictTo('student'), getStudentGrades)
router.get('/group', protect, restrictTo('teacher', 'admin'), getGroupGrades)
router.get('/lesson/:lessonId', protect, restrictTo('teacher', 'admin'), getLessonGrades)
router.post('/bulk', protect, restrictTo('teacher', 'admin'), setBulkGrades)

module.exports = router
