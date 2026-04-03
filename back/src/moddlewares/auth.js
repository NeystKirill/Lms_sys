const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Нет токена авторизации' })
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Токен истёк' })
      }
      return res.status(401).json({ message: 'Токен недействителен' })
    }

    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не найден' })
    }

    next()
  } catch (err) {
    return res.status(401).json({ message: 'Ошибка авторизации' })
  }
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Нет доступа для вашей роли' })
    }
    next()
  }
}

module.exports = { protect, restrictTo }
