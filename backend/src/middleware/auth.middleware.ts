import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/user.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    // Debug logging
    console.log('🔐 Auth middleware - Authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : 'MISSING');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Authorization header or invalid format');
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔑 Token received (first 20 chars):', token.substring(0, 20));

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      console.log('✅ Token verified for user:', decoded.id, decoded.email, decoded.role);
      req.user = decoded;
      next();
    } catch (error: any) {
      console.log('❌ Token verification failed:', error.message);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};
