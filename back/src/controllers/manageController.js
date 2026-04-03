const User = require('../models/User')
const Group = require('../models/Group')

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ role: 1, name: 1 })
    res.json({ users })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Заполните все поля' })
    }
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email уже используется' })

    const user = await User.create({ name, email, password, role: role || 'student' })
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Нельзя удалить свой аккаунт' })
    }
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Пользователь удалён' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('students', 'name email')
      .populate('teachers.teacherId', 'name email')
    res.json({ groups })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!group) return res.status(404).json({ message: 'Группа не найдена' })
    res.json({ group })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getUsers, createUser, updateUser, deleteUser, getGroups, updateGroup }
