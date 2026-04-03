const Grade = require('../models/Grade')
const Lesson = require('../models/Lesson')
const Group = require('../models/Group')
const ScheduleDay = require('../models/ScheduleDay')

const getLessonGrades = async (req, res) => {
  try {
    const { lessonId } = req.params
    const grades = await Grade.find({ lessonId }).populate('studentId', 'name email')
    res.json({ grades })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const setBulkGrades = async (req, res) => {
  try {
    const { lessonId, grades } = req.body
    const results = await Promise.all(
      grades.map(({ studentId, value, note }) =>
        Grade.findOneAndUpdate(
          { lessonId, studentId },
          { value, note: note || '', gradedBy: req.user._id },
          { upsert: true, new: true }
        )
      )
    )
    res.json({ updated: results.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.user._id
    const group = await Group.findOne({ students: studentId })
    if (!group) return res.json({ grades: [], average: null })

    const scheduleDays = await ScheduleDay.find({ groupId: group._id })
    const dayIds = scheduleDays.map((d) => d._id)
    const lessons = await Lesson.find({ scheduleDayId: { $in: dayIds } })
    const lessonIds = lessons.map((l) => l._id)

    const grades = await Grade.find({ studentId, lessonId: { $in: lessonIds } })
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'scheduleDayId', select: 'date' },
        ],
      })
      .sort({ createdAt: -1 })

    const numericGrades = grades
      .filter((g) => g.value !== 'Н' && !isNaN(Number(g.value)))
      .map((g) => Number(g.value))

    const average = numericGrades.length > 0
      ? Math.round(numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length)
      : null

    res.json({ grades, average })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getGroupGrades = async (req, res) => {
  try {
    let group
    if (req.user.role === 'admin') {
      group = await Group.findOne().populate('students', 'name email')
    } else {
      group = await Group.findOne({ 'teachers.teacherId': req.user._id }).populate('students', 'name email')
      if (!group) group = await Group.findOne().populate('students', 'name email')
    }
    if (!group) return res.json({ students: [], group: null })

    const scheduleDays = await ScheduleDay.find({ groupId: group._id })
    const dayIds = scheduleDays.map((d) => d._id)
    const lessons = await Lesson.find({ scheduleDayId: { $in: dayIds } })
    const lessonIds = lessons.map((l) => l._id)

    const studentsWithGrades = await Promise.all(
      group.students.map(async (student) => {
        const grades = await Grade.find({
          studentId: student._id,
          lessonId: { $in: lessonIds },
        })
        const numericGrades = grades
          .filter((g) => g.value !== 'Н' && !isNaN(Number(g.value)))
          .map((g) => Number(g.value))
        const average = numericGrades.length > 0
          ? Math.round(numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length)
          : null
        const absences = grades.filter((g) => g.value === 'Н').length
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          average,
          absences,
          count: grades.length,
        }
      })
    )

    res.json({ students: studentsWithGrades, group: group.name })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getLessonGrades, setBulkGrades, getStudentGrades, getGroupGrades }
