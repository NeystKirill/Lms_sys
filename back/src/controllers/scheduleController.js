const ScheduleDay = require('../models/ScheduleDay')
const Lesson = require('../models/Lesson')
const Group = require('../models/Group')
const Subject = require('../models/Subject')
const User = require('../models/User')

async function findGroupId(user) {
  if (user.role === 'student') {
    const group = await Group.findOne({ students: user._id })
    return group?._id || null
  }
  if (user.role === 'teacher') {
    let group = await Group.findOne({ 'teachers.teacherId': user._id })
    if (!group) group = await Group.findOne()
    return group?._id || null
  }
  if (user.role === 'admin') {
    const group = await Group.findOne()
    return group?._id || null
  }
  return null
}

const getTodaySchedule = async (req, res) => {
  try {
    const groupId = await findGroupId(req.user)
    if (!groupId) return res.json({ lessons: [], date: new Date() })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const scheduleDay = await ScheduleDay.findOne({
      groupId,
      date: { $gte: today, $lt: tomorrow },
    })

    if (!scheduleDay) return res.json({ lessons: [], date: today })

    const lessons = await Lesson.find({ scheduleDayId: scheduleDay._id })
      .populate('subjectId', 'name')
      .populate('teacherId', 'name')
      .sort({ lessonNumber: 1 })

    res.json({ lessons, date: scheduleDay.date })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getWeekSchedule = async (req, res) => {
  try {
    const groupId = await findGroupId(req.user)
    if (!groupId) return res.json({ days: [] })

    const offset = parseInt(req.query.offset) || 0

    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 7)

    const scheduleDays = await ScheduleDay.find({
      groupId,
      date: { $gte: monday, $lt: sunday },
    }).sort({ date: 1 })

    const days = await Promise.all(
      scheduleDays.map(async (day) => {
        const lessons = await Lesson.find({ scheduleDayId: day._id })
          .populate('subjectId', 'name')
          .populate('teacherId', 'name')
          .sort({ lessonNumber: 1 })
        return { date: day.date, dayId: day._id, lessons }
      })
    )

    res.json({ days })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Admin: cancel a lesson
const cancelLesson = async (req, res) => {
  try {
    const { id } = req.params
    const { statusNote } = req.body
    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { status: 'cancelled', statusNote: statusNote || 'Отменено администратором' },
      { new: true }
    ).populate('subjectId', 'name').populate('teacherId', 'name')
    if (!lesson) return res.status(404).json({ message: 'Пара не найдена' })
    res.json({ lesson })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Admin: restore a cancelled lesson
const restoreLesson = async (req, res) => {
  try {
    const { id } = req.params
    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { status: 'active', statusNote: null },
      { new: true }
    ).populate('subjectId', 'name').populate('teacherId', 'name')
    if (!lesson) return res.status(404).json({ message: 'Пара не найдена' })
    res.json({ lesson })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Admin: replace a lesson (change subject/teacher/time)
const replaceLesson = async (req, res) => {
  try {
    const { id } = req.params
    const { subjectId, teacherId, startTime, endTime, topic, description, statusNote } = req.body

    const updateData = {
      status: 'replaced',
      replacesLessonId: id,
      statusNote: statusNote || 'Замена',
    }
    if (subjectId) updateData.subjectId = subjectId
    if (teacherId) updateData.teacherId = teacherId
    if (startTime) updateData.startTime = startTime
    if (endTime) updateData.endTime = endTime
    if (topic) updateData.topic = topic
    if (description !== undefined) updateData.description = description

    const lesson = await Lesson.findByIdAndUpdate(id, updateData, { new: true })
      .populate('subjectId', 'name')
      .populate('teacherId', 'name')
    if (!lesson) return res.status(404).json({ message: 'Пара не найдена' })
    res.json({ lesson })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Admin: get available subjects and teachers for replacement
const getScheduleOptions = async (req, res) => {
  try {
    const subjects = await Subject.find().select('name description')
    const teachers = await User.find({ role: 'teacher' }).select('name email')
    res.json({ subjects, teachers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get next week schedule (for dashboard preview)
const getNextWeekSchedule = async (req, res) => {
  try {
    const groupId = await findGroupId(req.user)
    if (!groupId) return res.json({ days: [] })

    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    // Start from today's monday, show 7 days forward
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    const nextMonday = new Date(monday)
    nextMonday.setDate(monday.getDate() + 7)
    const nextFriday = new Date(nextMonday)
    nextFriday.setDate(nextMonday.getDate() + 7)

    const scheduleDays = await ScheduleDay.find({
      groupId,
      date: { $gte: nextMonday, $lt: nextFriday },
    }).sort({ date: 1 })

    const days = await Promise.all(
      scheduleDays.map(async (day) => {
        const lessons = await Lesson.find({ scheduleDayId: day._id })
          .populate('subjectId', 'name')
          .populate('teacherId', 'name')
          .sort({ lessonNumber: 1 })
        return { date: day.date, dayId: day._id, lessons }
      })
    )

    res.json({ days })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getTodaySchedule, getWeekSchedule, cancelLesson, restoreLesson, replaceLesson, getScheduleOptions, getNextWeekSchedule }
