require('dotenv').config()
const mongoose = require('mongoose')

const User = require('./models/User')
const Subject = require('./models/Subject')
const Group = require('./models/Group')
const ScheduleDay = require('./models/ScheduleDay')
const Lesson = require('./models/Lesson')
const Material = require('./models/Material')
const Attendance = require('./models/Attendance')
const Grade = require('./models/Grade')

const getMonday = (offsetWeeks = 0) => {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7) + offsetWeeks * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const getWeekday = (weekOffset, dayOffset) => {
  const monday = getMonday(weekOffset)
  monday.setDate(monday.getDate() + dayOffset)
  return monday
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB\n')

    console.log('🗑️  Clearing existing data...')
    await Grade.deleteMany({})
    await Attendance.deleteMany({})
    await Material.deleteMany({})
    await Lesson.deleteMany({})
    await ScheduleDay.deleteMany({})
    await Group.deleteMany({})
    await Subject.deleteMany({})
    await User.deleteMany({})
    console.log('✅ Cleared\n')

    console.log('📚 Creating subjects...')
    const subjects = await Subject.insertMany([
      { name: 'Проектирование и обеспечение бесперебойной работы web-сайта', description: 'Web-разработка' },
      { name: 'Применение базовых знаний экономики и основ предпринимательства', description: 'Экономика' },
      { name: 'Развитие и совершенствование физических качеств', description: 'Физкультура' },
      { name: 'Программирование модулей программного обеспечения', description: 'Программирование' },
    ])
    const [subWeb, subEcon, subPhys, subProg] = subjects
    console.log('✅ Subjects created\n')

    console.log('👤 Creating users...')

    const admin = await User.create({
      name: 'Администратор',
      email: 'admin@lms.kz',
      password: 'admin123',
      role: 'admin',
    })

    const teacherKus = await User.create({
      name: 'Кусманова Асель',
      email: 'kusmanova@lms.kz',
      password: 'teacher123',
      role: 'teacher',
    })
    const teacherZhay = await User.create({
      name: 'Жайлеубай Э.Н.',
      email: 'zhayleubay@lms.kz',
      password: 'teacher123',
      role: 'teacher',
    })
    const teacherAku = await User.create({
      name: 'Акубаева Б.А.',
      email: 'akubaeva@lms.kz',
      password: 'teacher123',
      role: 'teacher',
    })
    const teacherKar = await User.create({
      name: 'Каракузов Б.Е.',
      email: 'karakuzov@lms.kz',
      password: 'teacher123',
      role: 'teacher',
    })

    // All 22 students for ПО2406
    const studentsData = [
      { name: 'Абдышев Алдияр Батырбекович',    email: 'abdyshev@lms.kz',     password: 'Po2406_abd' },
      { name: 'Айт Ерәли Ерасылулы',            email: 'ait@lms.kz',           password: 'Po2406_ait' },
      { name: 'Бахытжан Бахтияр',               email: 'bakhytjan@lms.kz',     password: 'Po2406_bah' },
      { name: 'Берик Мансур Берикули',           email: 'berik@lms.kz',         password: 'Po2406_ber' },
      { name: 'Григорьев Богдан Михайлович',    email: 'grigoriev@lms.kz',     password: 'Po2406_gri' },
      { name: 'Жаманбалинов Агмаз Талгатович',  email: 'zhamanbalinov@lms.kz', password: 'Po2406_zha' },
      { name: 'Жоламан Султан Ерланулы',        email: 'zholaman@lms.kz',      password: 'Po2406_zhl' },
      { name: 'Жумабаев Жангир Амирханович',    email: 'zhumabaev@lms.kz',     password: 'Po2406_zhb' },
      { name: 'Жумабеков Алдияр Ермекович',     email: 'zhumabekov@lms.kz',    password: 'Po2406_zbk' },
      { name: 'Зарахов Берс Русланович',        email: 'zarakhov@lms.kz',      password: 'Po2406_zar' },
      { name: 'Кадыров Кирилл Андреевич',       email: 'kadyrov@lms.kz',       password: 'Po2406_kad' },
      { name: 'Кадырбай Каусар Сулейменкызы',   email: 'kadyrbay@lms.kz',      password: 'Po2406_kdb' },
      { name: 'Койшыбай Арсен Маратули',        email: 'koishibay@lms.kz',     password: 'Po2406_koi' },
      { name: 'Орынгали Әділжан Талгатулы',     email: 'oryngali@lms.kz',      password: 'Po2406_ory' },
      { name: 'Оспанов Бектемир Батажанович',   email: 'ospanov@lms.kz',       password: 'Po2406_osp' },
      { name: 'Оспанова Айым Медетовна',        email: 'ospanova@lms.kz',      password: 'Po2406_osa' },
      { name: 'Отинчиев Гани Муратович',        email: 'otynchiev@lms.kz',     password: 'Po2406_oti' },
      { name: 'Сабанчи Айли Ериккызы',          email: 'sabanchi@lms.kz',      password: 'Po2406_sab' },
      { name: 'Садыков Альтаир Султанбекович',  email: 'sadykov@lms.kz',       password: 'Po2406_sad' },
      { name: 'Сейтхан Альтаир Абилханулы',     email: 'seithkhan@lms.kz',     password: 'Po2406_sei' },
      { name: 'Уапов Саид Даулбаевич',          email: 'uapov@lms.kz',         password: 'Po2406_uap' },
      { name: 'Ульянов Александр Ильич',        email: 'ulyanov@lms.kz',       password: 'Po2406_uly' },
    ]

    const students = await Promise.all(
      studentsData.map((s) => User.create({ ...s, role: 'student' }))
    )
    console.log(`✅ ${students.length} students created\n`)

    console.log('👥 Creating group...')
    const group = await Group.create({
      name: 'ПО2406',
      description: 'Программное обеспечение, набор 2024',
      students: students.map((s) => s._id),
      teachers: [
        { teacherId: teacherKus._id, role: 'main', subjects: [subPhys._id] },
        { teacherId: teacherZhay._id, role: 'assistant', subjects: [subWeb._id] },
        { teacherId: teacherAku._id, role: 'assistant', subjects: [subEcon._id] },
        { teacherId: teacherKar._id, role: 'assistant', subjects: [subProg._id] },
      ],
    })
    console.log('✅ Group "ПО2406" created\n')

    const weekTemplate = [
      {
        dayOffset: 0,
        name: 'Понедельник',
        lessons: [
          { num: 1, start: '13:30', end: '15:00', subject: subWeb, teacher: teacherZhay, topic: 'Введение в проектирование web-сайтов', room: 'C1.3.230' },
          { num: 2, start: '15:20', end: '16:50', subject: subEcon, teacher: teacherAku, topic: 'Основы предпринимательства', room: 'C1.3.227' },
          { num: 3, start: '17:00', end: '18:30', subject: subPhys, teacher: teacherKus, topic: 'Развитие физических качеств', room: 'Спорт.зал' },
        ],
      },
      {
        dayOffset: 1,
        name: 'Вторник',
        lessons: [
          { num: 1, start: '13:30', end: '15:00', subject: subWeb, teacher: teacherZhay, topic: 'Обеспечение бесперебойной работы сайта', room: 'C1.3.228' },
          { num: 2, start: '15:20', end: '16:50', subject: subWeb, teacher: teacherZhay, topic: 'HTTP-протоколы и безопасность', room: 'C1.3.228' },
          { num: 3, start: '17:00', end: '18:30', subject: subProg, teacher: teacherKar, topic: 'Введение в программирование модулей', room: 'C1.3.228' },
        ],
      },
      {
        dayOffset: 2,
        name: 'Среда',
        lessons: [
          { num: 1, start: '13:30', end: '15:00', subject: subProg, teacher: teacherKar, topic: 'Алгоритмы и структуры данных', room: 'C1.3.240' },
          { num: 2, start: '15:20', end: '16:50', subject: subProg, teacher: teacherKar, topic: 'Паттерны проектирования ПО', room: 'C1.3.240' },
          { num: 3, start: '17:00', end: '18:30', subject: subWeb, teacher: teacherZhay, topic: 'Проектирование архитектуры web-приложений', room: 'C1.3.240' },
        ],
      },
      {
        dayOffset: 3,
        name: 'Четверг',
        lessons: [
          { num: 1, start: '13:30', end: '15:00', subject: subWeb, teacher: teacherZhay, topic: 'CSS и адаптивная верстка', room: 'C1.3.229' },
          { num: 2, start: '15:20', end: '16:50', subject: subProg, teacher: teacherKar, topic: 'Объектно-ориентированное программирование', room: 'C1.3.229' },
          { num: 3, start: '17:00', end: '18:30', subject: subEcon, teacher: teacherAku, topic: 'Основы экономики предприятия', room: 'C1.3.227' },
        ],
      },
      {
        dayOffset: 4,
        name: 'Пятница',
        lessons: [
          { num: 1, start: '13:30', end: '15:00', subject: subProg, teacher: teacherKar, topic: 'Тестирование программных модулей', room: 'C1.3.241' },
          { num: 2, start: '15:20', end: '16:50', subject: subWeb, teacher: teacherZhay, topic: 'JavaScript и динамика на сайте', room: 'C1.3.241' },
          { num: 3, start: '17:00', end: '18:30', subject: subProg, teacher: teacherKar, topic: 'Работа с базами данных', room: 'C1.3.241' },
        ],
      },
    ]

    console.log('📅 Creating schedule (current + next 2 weeks)...')
    const allCreatedLessons = [] // collect for materials

    for (let week = 0; week < 3; week++) {
      for (const dayData of weekTemplate) {
        const date = getWeekday(week, dayData.dayOffset)

        const existing = await ScheduleDay.findOne({ groupId: group._id, date })
        if (existing) continue

        const scheduleDay = await ScheduleDay.create({ groupId: group._id, date })

        for (const l of dayData.lessons) {
          const lesson = await Lesson.create({
            scheduleDayId: scheduleDay._id,
            groupId: group._id,
            teacherId: l.teacher._id,
            subjectId: l.subject._id,
            lessonNumber: l.num,
            startTime: l.start,
            endTime: l.end,
            topic: l.topic,
            description: `Аудитория: ${l.room}`,
            status: 'active',
          })
          allCreatedLessons.push({ lesson, dayData, week })
        }
      }
      const weekNames = ['Текущая неделя', 'Следующая неделя', 'Через 2 недели']
      console.log(`  ✅ ${weekNames[week]} — 5 дней создано`)
    }

    // Create test materials for first 5 unique lessons (one per subject topic)
    console.log('\n📎 Creating test materials...')
    const materialsTemplate = [
      {
        title: 'Лекция: Введение в HTML5 и семантическую вёрстку',
        type: 'link',
        url: 'https://developer.mozilla.org/ru/docs/Web/HTML',
        description: 'Официальная документация MDN по HTML5',
      },
      {
        title: 'Видеоурок: CSS Grid и Flexbox',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example1',
        description: 'Подробный разбор современных техник вёрстки',
      },
      {
        title: 'Методичка по алгоритмам',
        type: 'file',
        url: 'https://storage.example.com/algos.pdf',
        description: 'Основные алгоритмы сортировки и поиска с примерами',
      },
      {
        title: 'Основы ООП — слайды',
        type: 'link',
        url: 'https://slides.example.com/oop',
        description: 'Презентация по объектно-ориентированному программированию',
      },
      {
        title: 'Экономика предприятия — учебник гл. 1-3',
        type: 'link',
        url: 'https://textbook.example.com/econ',
        description: 'Первые три главы учебника по экономике',
      },
    ]

    // Add materials to 5 different lessons from week 0
    const week0Lessons = allCreatedLessons.filter((l) => l.week === 0)
    const firstFive = week0Lessons.slice(0, 5)
    for (let i = 0; i < firstFive.length; i++) {
      const mat = materialsTemplate[i]
      await Material.create({
        lessonId: firstFive[i].lesson._id,
        addedBy: admin._id,
        ...mat,
      })
    }
    console.log('✅ 5 test materials created\n')

    // Add some attendance for past lessons (current week days that already passed)
    console.log('📊 Creating sample attendance for past days...')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const pastLessons = allCreatedLessons.filter((item) => {
      const lessonDate = getWeekday(item.week, item.dayData.dayOffset)
      return lessonDate < today && item.week === 0
    })

    if (pastLessons.length > 0) {
      const statuses = ['present', 'present', 'present', 'late', 'absent']
      for (const { lesson } of pastLessons) {
        for (let i = 0; i < students.length; i++) {
          const status = statuses[i % statuses.length]
          try {
            await Attendance.create({
              lessonId: lesson._id,
              studentId: students[i]._id,
              markedBy: admin._id,
              status,
            })
          } catch (_) {}
        }
      }
      console.log(`✅ Attendance created for ${pastLessons.length} past lessons\n`)
    } else {
      console.log('ℹ️  No past lessons this week to add attendance\n')
    }

    console.log('\n🎉 Seed completed!\n')
    console.log('═══════════════════════════════════════════════════')
    console.log('📋 АККАУНТЫ ДЛЯ ВХОДА:')
    console.log('═══════════════════════════════════════════════════')
    console.log('👑 АДМИНИСТРАТОР:')
    console.log('   admin@lms.kz           / admin123')
    console.log('───────────────────────────────────────────────────')
    console.log('🎓 УЧИТЕЛЯ:')
    console.log('   kusmanova@lms.kz       / teacher123  (Физкультура)')
    console.log('   zhayleubay@lms.kz      / teacher123  (Web)')
    console.log('   akubaeva@lms.kz        / teacher123  (Экономика)')
    console.log('   karakuzov@lms.kz       / teacher123  (Программирование)')
    console.log('───────────────────────────────────────────────────')
    console.log('👨‍🎓 СТУДЕНТЫ ГРУППЫ ПО2406:')
    studentsData.forEach((s, i) => {
      const num = String(i + 1).padStart(2, ' ')
      console.log(`   ${num}. ${s.email.padEnd(28)} / ${s.password}`)
    })
    console.log('═══════════════════════════════════════════════════\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed error:', err.message)
    console.error(err)
    process.exit(1)
  }
}

seed()
