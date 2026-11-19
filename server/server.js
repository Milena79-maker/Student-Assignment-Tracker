import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import assignmentsRoutes from './routes/assignments-routes.js'
import userRoutes from './routes/user-routes.js'
import { seedIfEmpty } from './utils/seed.js'

dotenv.config()

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy server/.env.example to server/.env')
  process.exit(1)
}

const PORT = process.env.PORT || 3001
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assignments'

async function connectDB(uri) {
  for (let attempt = 1; attempt <= 15; attempt += 1) {
    try {
      await mongoose.connect(uri)
      console.log('MongoDB database connection established successfully')
      return
    } catch (error) {
      console.log(`MongoDB not ready (attempt ${attempt}): ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
  throw new Error('Could not connect to MongoDB')
}

await connectDB(MONGO_URI)
await seedIfEmpty()

const app = express()
app.disable('x-powered-by')
app.use(cors())
app.use(express.json({ limit: '100kb' }))

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
})

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/assignments', assignmentsRoutes)
app.use('/users', userRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' })
})

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be JSON.' })
  }
  console.error(error)
  res.status(500).json({ message: 'Something went wrong.' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
