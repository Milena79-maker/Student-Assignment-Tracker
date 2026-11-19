import mongoose from 'mongoose'
import AssignmentModel from '../models/assignment-model.js'

const PRIORITIES = ['low', 'medium', 'high']

function parseDueDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date
}

function readAssignment(body) {
  const errors = []
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const course = typeof body.course === 'string' ? body.course.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const priority = body.priority == null || body.priority === '' ? 'medium' : body.priority
  const dueDate = parseDueDate(body.dueDate)

  if (!title) errors.push('Title is required.')
  else if (title.length > 120) errors.push('Title must be 120 characters or fewer.')

  if (!course) errors.push('Course is required.')
  else if (course.length > 80) errors.push('Course must be 80 characters or fewer.')

  if (!body.dueDate) errors.push('Due date is required.')
  else if (!dueDate) errors.push('Due date must be a real date.')

  if (!PRIORITIES.includes(priority)) errors.push('Priority must be low, medium, or high.')
  if (description.length > 2000) errors.push('Description must be 2000 characters or fewer.')

  return {
    errors,
    data: { title, course, description, priority, dueDate },
  }
}

export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await AssignmentModel.find().sort({ dueDate: 1, createdAt: 1 })
    res.status(200).json(assignments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAssignmentById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid assignment id.' })
    }
    const assignment = await AssignmentModel.findById(req.params.id)
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' })
    res.status(200).json(assignment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createAssignment = async (req, res) => {
  try {
    const { errors, data } = readAssignment(req.body || {})
    if (errors.length) return res.status(400).json({ message: errors[0], errors })
    const assignment = await AssignmentModel.create(data)
    res.status(201).json(assignment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateAssignment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid assignment id.' })
    }
    const { errors, data } = readAssignment(req.body || {})
    if (errors.length) return res.status(400).json({ message: errors[0], errors })
    const assignment = await AssignmentModel.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    })
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' })
    res.status(200).json(assignment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const setCompleted = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid assignment id.' })
    }
    if (typeof req.body?.completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed must be true or false.' })
    }
    const assignment = await AssignmentModel.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    )
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' })
    res.status(200).json(assignment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteAssignment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid assignment id.' })
    }
    const assignment = await AssignmentModel.findByIdAndDelete(req.params.id)
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' })
    res.status(200).json({ message: 'Assignment deleted.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
