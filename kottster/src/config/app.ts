import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.KOTTSTER_PORT || '5480', 10),
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Database
  database: {
    host: process.env.DATABASE_HOST || 'db',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'studiosync',
    user: process.env.DATABASE_USER || 'studio_user',
    password: process.env.DATABASE_PASSWORD || 'studio_password',
    pool: {
      min: 2,
      max: 10
    }
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://redis:6379/0'
  },

  // Authentication
  auth: {
    jwtSecret: process.env.DJANGO_SECRET_KEY || 'dev-secret-key-change-in-production',
    jwtAlgorithm: 'HS256' as const,
    sessionTTL: 3600 // 1 hour
  },

  // Security
  security: {
    corsOrigins: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.BACKEND_URL || 'http://localhost:8000',
      'http://localhost:5480'
    ].filter(Boolean),
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100,
    internalApiSecret: process.env.INTERNAL_API_SECRET || 'change-in-production'
  }
};
