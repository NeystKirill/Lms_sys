const express = require('express')
const router = express.Router()
const {
  getLessonAttendance,
  markBulk,
  removeAttendance,
  getStudentAttendance,
  getGroupAttendance,
  getWeekLessons,
} = require('../controllers/attendanceController')
const { protect, restrictTo } = require('../moddlewares/auth')

router.get('/my', protect, restrictTo('student'), getStudentAttendance)
router.get('/group', protect, restrictTo('teacher', 'admin'), getGroupAttendance)
router.get('/week-lessons', protect, restrictTo('teacher', 'admin'), getWeekLessons)
router.get('/lesson/:lessonId', protect, restrictTo('teacher', 'admin'), getLessonAttendance)
router.post('/bulk', protect, restrictTo('teacher', 'admin'), markBulk)
router.delete('/lesson/:lessonId/student/:studentId', protect, restrictTo('teacher', 'admin'), removeAttendance)

module.exports = router
