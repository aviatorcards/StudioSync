import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/app';
import { corsOptions } from './config/cors';
import { validateJWT } from './middleware/auth';

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'kottster-admin' });
});

// Protected routes (require JWT authentication)
app.use('/api', validateJWT);

// Import API routes
import featureFlagsRouter from './routes/featureFlags';
import usersRouter from './routes/users';
import studiosRouter from './routes/studios';
import teachersRouter from './routes/teachers';
import studentsRouter from './routes/students';
import lessonsRouter from './routes/lessons';

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Kottster Admin API',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Resource routes
app.use('/api/feature-flags', featureFlagsRouter);
app.use('/api/users', usersRouter);
app.use('/api/studios', studiosRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/lessons', lessonsRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kottster Admin Panel running on port ${PORT}`);
  console.log(`Environment: ${config.environment}`);
});

export default app;
