const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Заполните все поля' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ message: 'Email уже используется' })
    }

    const user = await User.create({ name, email, password, role: 'student' })

    res.status(201).json({
      message: 'Пользователь создан',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Введите email и пароль' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }

    const token = signToken(user._id, user.role)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message })
  }
}

const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  })
}

module.exports = { register, login, getMe }
