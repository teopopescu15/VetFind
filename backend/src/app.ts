import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import sampleRoutes from './routes/sample.routes';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import companyServiceRoutes from './routes/companyService.routes';
import serviceCategoryRoutes from './routes/serviceCategory';

// Import error handler middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Create Express app
const app: Application = express();

// Middleware
app.use(helmet()); // Security headers

// Configure CORS for mobile and web access
const corsOptions = {
  origin: function (origin: string | undefined, callback: any) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:8082',
      'http://localhost:8081',
      'http://localhost:19006',
      'http://172.23.126.178:8082', // Your local IP
      'http://172.23.126.178:8081',
      'exp://172.23.126.178:8081', // Expo URLs
      /^exp:\/\/.*/, // Allow all Expo URLs in development
      /^http:\/\/192\.168\..*/, // Allow local network IPs
      /^http:\/\/172\..*/, // Allow Docker/WSL IPs
      /^http:\/\/10\..*/, // Allow private network IPs
    ];
    
    const allowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (allowed) {
      callback(null, true);
    } else {
      console.log('Blocked CORS request from:', origin);
      callback(null, true); // In development, allow anyway
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Enable CORS with options
app.use(compression()); // Compress responses
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
  });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/sample', sampleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes); // Company routes
app.use('/api/companies', companyServiceRoutes); // Company service routes at /api/companies/:companyId/services
app.use('/api/services', companyServiceRoutes); // Also mount at /api/services for templates endpoint
app.use('/api/service-categories', serviceCategoryRoutes); // Service categories and specializations

// Error handling middleware (should be last)
app.use(notFound);
app.use(errorHandler);

export default app;