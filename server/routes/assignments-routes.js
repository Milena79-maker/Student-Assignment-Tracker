import express from 'express'
import authMiddleware from '../middlewares/auth.js'
import {
  createAssignment,
  deleteAssignment,
  getAllAssignments,
  getAssignmentById,
  setCompleted,
  updateAssignment,
} from '../controllers/assignments-controllers.js'

const router = express.Router()

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

router.get('/', getAllAssignments)
router.get('/:id', getAssignmentById)
router.post('/', authMiddleware, createAssignment)
router.put('/:id', authMiddleware, updateAssignment)
router.patch('/:id', authMiddleware, setCompleted)
router.delete('/:id', authMiddleware, deleteAssignment)

export default router
