require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const connectDB = require('./config/db')

require('./models/User')
require('./models/Subject')
require('./models/Group')
require('./models/ScheduleDay')
require('./models/Lesson')
require('./models/Material')
require('./models/Attendance')
require('./models/Grade')

const app = express()

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173' , 'http://localhost:5173',
  'https://lms-chi-pied.vercel.app',],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
connectDB()

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/schedule', require('./routes/scheduleRoutes'))
app.use('/api/attendance', require('./routes/attendanceRoutes'))
app.use('/api/manage', require('./routes/manageRoutes'))
app.use('/api/grades', require('./routes/gradeRoutes'))
app.use('/api/materials', require('./routes/materialRoutes'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
