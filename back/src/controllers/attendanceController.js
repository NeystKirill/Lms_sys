const Attendance = require('../models/Attendance')
const Lesson = require('../models/Lesson')
const Group = require('../models/Group')
const ScheduleDay = require('../models/ScheduleDay')

async function findTeacherGroup(userId, role) {
  let group

  if (role === 'admin') {
    group = await Group.findOne().populate('students', 'name email')
    return group
  }

  group = await Group.findOne({ 'teachers.teacherId': userId }).populate('students', 'name email')
  if (group) return group

  group = await Group.findOne().populate('students', 'name email')
  return group
}

const getLessonAttendance = async (req, res) => {
  try {
    const { lessonId } = req.params
    const records = await Attendance.find({ lessonId }).populate('studentId', 'name email')
    res.json({ records })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const markBulk = async (req, res) => {
  try {
    const { lessonId, records } = req.body
    const results = await Promise.all(
      records.map(({ studentId, status, note }) =>
        Attendance.findOneAndUpdate(
          { lessonId, studentId },
          { status, note: note || '', markedBy: req.user._id },
          { upsert: true, new: true }
        )
      )
    )
    res.json({ updated: results.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const removeAttendance = async (req, res) => {
  try {
    const { lessonId, studentId } = req.params
    await Attendance.findOneAndDelete({ lessonId, studentId })
    res.json({ message: 'Запись удалена' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id
    const group = await Group.findOne({ students: studentId })
    if (!group) return res.json({ records: [], total: 0, present: 0, late: 0, absent: 0, percent: 0 })

    const scheduleDays = await ScheduleDay.find({ groupId: group._id })
    const dayIds = scheduleDays.map((d) => d._id)
    const lessons = await Lesson.find({ scheduleDayId: { $in: dayIds } })
    const lessonIds = lessons.map((l) => l._id)

    const records = await Attendance.find({ studentId, lessonId: { $in: lessonIds } })
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'scheduleDayId', select: 'date' },
        ],
      })
      .sort({ createdAt: -1 })

    const total = lessonIds.length
    const present = records.filter((r) => r.status === 'present').length
    const late = records.filter((r) => r.status === 'late').length
    const absent = total - present - late
    const percent = total > 0 ? Math.round(((present + late) / total) * 100) : 0

    res.json({ records, total, present, late, absent, percent })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getGroupAttendance = async (req, res) => {
  try {
    const group = await findTeacherGroup(req.user._id, req.user.role)
    if (!group) return res.json({ students: [], group: null, total: 0 })

    const scheduleDays = await ScheduleDay.find({ groupId: group._id })
    const dayIds = scheduleDays.map((d) => d._id)
    const lessons = await Lesson.find({ scheduleDayId: { $in: dayIds } })
    const lessonIds = lessons.map((l) => l._id)
    const total = lessonIds.length

    const studentsWithStats = await Promise.all(
      group.students.map(async (student) => {
        const records = await Attendance.find({
          studentId: student._id,
          lessonId: { $in: lessonIds },
        })
        const present = records.filter((r) => r.status === 'present').length
        const late = records.filter((r) => r.status === 'late').length
        const percent = total > 0 ? Math.round(((present + late) / total) * 100) : 0
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          present,
          late,
          absent: total - present - late,
          total,
          percent,
        }
      })
    )

    res.json({ students: studentsWithStats, group: group.name, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getWeekLessons = async (req, res) => {
  try {
    const group = await findTeacherGroup(req.user._id, req.user.role)
    if (!group) return res.json({ lessons: [], students: [] })

    const offset = parseInt(req.query.offset) || 0
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 7)

    const scheduleDays = await ScheduleDay.find({
      groupId: group._id,
      date: { $gte: monday, $lt: sunday },
    }).sort({ date: 1 })

    const allLessons = []
    for (const day of scheduleDays) {
      const lessons = await Lesson.find({ scheduleDayId: day._id })
        .populate('subjectId', 'name')
        .populate('teacherId', 'name')
        .sort({ lessonNumber: 1 })
      lessons.forEach((l) => allLessons.push({ ...l.toObject(), date: day.date }))
    }

    res.json({ lessons: allLessons, students: group.students, groupName: group.name })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getLessonAttendance,
  markBulk,
  removeAttendance,
  getStudentAttendance,
  getGroupAttendance,
  getWeekLessons,
}
