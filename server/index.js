import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import assignmentsRouter from './routes/assignments.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/assignments', assignmentsRouter);
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_assignment_tracker';
mongoose.connect(uri).then(() => {
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}).catch(error => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
