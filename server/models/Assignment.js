import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
  course: { type: String, required: [true, 'Course is required'], trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  dueDate: { type: String, required: [true, 'Due date is required'], match: [/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'] },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
