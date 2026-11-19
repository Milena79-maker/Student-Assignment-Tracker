import express from 'express'
import authMiddleware from '../middlewares/auth.js'
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUserById,
  loginUser,
  updateMe,
  updateUser,
} from '../controllers/user-controllers.js'

const router = express.Router()

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

router.get('/', getAllUsers)
router.post('/', createUser)
router.post('/login', loginUser)

router.get('/me', authMiddleware, getMe)
router.put('/me', authMiddleware, updateMe)
router.delete('/me', authMiddleware, deleteMe)

router.get('/:id', getUserById)
router.put('/:id', authMiddleware, updateUser)
router.delete('/:id', authMiddleware, deleteUser)

export default router
