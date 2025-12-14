import { Router } from 'express';
import {
  createAppointment,
  getAvailableSlots,
  getUserAppointments,
  cancelAppointment,
} from '../controllers/appointments';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/appointments - Create new appointment (requires auth)
router.post('/', authMiddleware, createAppointment);

// GET /api/appointments/availability/:companyId/:serviceId - Get available time slots (public)
router.get('/availability/:companyId/:serviceId', getAvailableSlots);

// GET /api/appointments/user - Get user's appointments (requires auth)
router.get('/user', authMiddleware, getUserAppointments);

// PATCH /api/appointments/:id/cancel - Cancel appointment (requires auth)
router.patch('/:id/cancel', authMiddleware, cancelAppointment);

export default router;
