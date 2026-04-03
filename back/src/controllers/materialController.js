const Material = require('../models/Material')
const Lesson = require('../models/Lesson')

const getMaterialsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    const materials = await Material.find({ lessonId })
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
    res.json({ materials })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createMaterial = async (req, res) => {
  try {
    const { lessonId, title, type, url, description } = req.body
    if (!lessonId || !title || !type || !url) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' })
    }
    // Verify lesson exists
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) return res.status(404).json({ message: 'Пара не найдена' })

    const material = await Material.create({
      lessonId,
      title,
      type,
      url,
      description: description || '',
      addedBy: req.user._id,
    })
    const populated = await material.populate('addedBy', 'name')
    res.status(201).json({ material: populated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateMaterial = async (req, res) => {
  try {
    const { title, type, url, description } = req.body
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { title, type, url, description },
      { new: true, runValidators: true }
    ).populate('addedBy', 'name')
    if (!material) return res.status(404).json({ message: 'Материал не найден' })
    res.json({ material })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id)
    if (!material) return res.status(404).json({ message: 'Материал не найден' })
    res.json({ message: 'Материал удалён' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getMaterialsByLesson, createMaterial, updateMaterial, deleteMaterial }
