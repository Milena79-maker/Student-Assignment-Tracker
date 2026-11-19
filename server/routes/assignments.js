import { Router } from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';

const router = Router();
const validId = (req, res, next) => mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'Invalid assignment ID' });
const errorResponse = (res, err) => res.status(400).json({ message: err.message });

router.get('/', async (_req, res) => {
  try { res.json(await Assignment.find().sort({ completed: 1, dueDate: 1, createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', validId, async (req, res) => {
  try { const item = await Assignment.findById(req.params.id); return item ? res.json(item) : res.status(404).json({ message: 'Assignment not found' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', async (req, res) => {
  try { res.status(201).json(await Assignment.create(req.body)); }
  catch (err) { errorResponse(res, err); }
});
router.put('/:id', validId, async (req, res) => {
  try {
    const item = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return item ? res.json(item) : res.status(404).json({ message: 'Assignment not found' });
  } catch (err) { errorResponse(res, err); }
});
router.patch('/:id/complete', validId, async (req, res) => {
  try {
    if (typeof req.body.completed !== 'boolean') return res.status(400).json({ message: 'completed must be true or false' });
    const item = await Assignment.findByIdAndUpdate(req.params.id, { completed: req.body.completed }, { new: true });
    return item ? res.json(item) : res.status(404).json({ message: 'Assignment not found' });
  } catch (err) { errorResponse(res, err); }
});
router.delete('/:id', validId, async (req, res) => {
  try {
    const item = await Assignment.findByIdAndDelete(req.params.id);
    return item ? res.json({ message: 'Assignment deleted successfully' }) : res.status(404).json({ message: 'Assignment not found' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
export default router;
