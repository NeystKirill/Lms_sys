const express = require('express')
const router = express.Router()
const {
  getTodaySchedule,
  getWeekSchedule,
  cancelLesson,
  restoreLesson,
  replaceLesson,
  getScheduleOptions,
  getNextWeekSchedule,
} = require('../controllers/scheduleController')
const { protect, restrictTo } = require('../moddlewares/auth')

router.get('/today', protect, getTodaySchedule)
router.get('/week', protect, getWeekSchedule)
router.get('/next-week', protect, getNextWeekSchedule)
router.get('/options', protect, restrictTo('admin'), getScheduleOptions)
router.patch('/lesson/:id/cancel', protect, restrictTo('admin'), cancelLesson)
router.patch('/lesson/:id/restore', protect, restrictTo('admin'), restoreLesson)
router.patch('/lesson/:id/replace', protect, restrictTo('admin'), replaceLesson)

module.exports = router
