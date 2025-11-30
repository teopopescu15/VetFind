/**
 * Routes API Routes
 * Endpoints for driving distance calculations
 */

import { Router } from 'express';
import { routesController } from '../controllers/routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/routes/distances
 * Calculate driving distances from user location to companies
 * Requires authentication
 */
router.post('/distances', authMiddleware, routesController.calculateDistances);

/**
 * GET /api/routes/status
 * Check if Google Routes API is configured
 * Public endpoint for debugging
 */
router.get('/status', routesController.getStatus);

export default router;
