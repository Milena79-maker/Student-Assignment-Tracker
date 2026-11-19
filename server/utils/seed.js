import mongoose from 'mongoose'
import AssignmentModel from '../models/assignment-model.js'

const metaSchema = new mongoose.Schema({
  key: { type: String, unique: true },
})

const Meta = mongoose.models.Meta || mongoose.model('Meta', metaSchema)

function daysFromToday(offset) {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12, 0, 0))
}

export async function seedIfEmpty() {
  const already = await Meta.findOne({ key: 'seeded' })
  if (already) return

  const count = await AssignmentModel.countDocuments()
  if (count === 0) {
    await AssignmentModel.insertMany([
      {
        title: 'Industrial Revolution essay',
        course: 'HIST 210',
        description: 'Four pages on how factory work changed city life. Cite two primary sources.',
        dueDate: daysFromToday(-2),
        priority: 'high',
        completed: false,
      },
      {
        title: 'Problem set 6',
        course: 'MATH 141',
        description: 'Integrals, sections 5.3 through 5.5. Show each step.',
        dueDate: daysFromToday(0),
        priority: 'medium',
        completed: false,
      },
      {
        title: 'Lab report: osmosis',
        course: 'BIO 110',
        description: 'Include the data table, a graph, and a short conclusion.',
        dueDate: daysFromToday(2),
        priority: 'high',
        completed: false,
      },
      {
        title: 'Vocabulary quiz',
        course: 'SPAN 102',
        description: 'Chapters 4 and 5. Practice the verb list.',
        dueDate: daysFromToday(6),
        priority: 'low',
        completed: false,
      },
      {
        title: 'Reading response',
        course: 'ENGL 105',
        description: 'One page on the assigned short story.',
        dueDate: daysFromToday(-1),
        priority: 'medium',
        completed: true,
      },
    ])
    console.log('Seeded sample assignments')
  }

  await Meta.create({ key: 'seeded' })
}
