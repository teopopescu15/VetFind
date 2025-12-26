import { Router } from 'express';
import {
  createAppointment,
  getAvailableSlots,
  getUserAppointments,
  getCompanyAppointments,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
} from '../controllers/appointments';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/appointments - Create new appointment (requires auth)
router.post('/', authMiddleware, createAppointment);

// GET /api/appointments/availability/:companyId/:serviceId - Get available time slots (public)
router.get('/availability/:companyId/:serviceId', getAvailableSlots);

// GET /api/appointments/user - Get user's appointments (requires auth)
router.get('/user', authMiddleware, getUserAppointments);

// GET /api/appointments/company - Get company's appointments (requires auth)
router.get('/company', authMiddleware, getCompanyAppointments);

// PATCH /api/appointments/:id - Update appointment (requires auth)
router.patch('/:id', authMiddleware, updateAppointment);

// PATCH /api/appointments/:id/cancel - Cancel appointment (requires auth)
router.patch('/:id/cancel', authMiddleware, cancelAppointment);

// DELETE /api/appointments/:id - Delete appointment (requires auth)
router.delete('/:id', authMiddleware, deleteAppointment);

export default router;
