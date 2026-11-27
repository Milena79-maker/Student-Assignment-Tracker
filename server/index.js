import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import assignmentsRouter from './routes/assignments.js';
import userRouter from './routes/user-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/assignments', assignmentsRouter);
app.use('/api/users', userRouter);

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (error) => {
    if (error) next();
  });
});
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri && process.env.NODE_ENV === 'production') {
  console.error('MONGODB_URI is missing. Add it in the Render environment.');
  process.exit(1);
}
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('JWT_SECRET is missing. Add it in the Render environment.');
  process.exit(1);
}

const mongoUri = uri || 'mongodb://127.0.0.1:27017/student_assignment_tracker';
mongoose.connect(mongoUri).then(() => {
  app.listen(port, '0.0.0.0', () => console.log(`Server is running on port ${port}`));
}).catch((error) => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});
