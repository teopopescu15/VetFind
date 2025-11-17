import { Router } from 'express';
import {
  createAppointment,
  getAppointmentById,
  getMyAppointments,
  getUpcomingAppointments,
  getPastAppointments,
  getClinicAppointments,
  updateAppointment,
  cancelAppointment,
  deleteAppointment
} from '../controllers/appointment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All appointment routes require authentication
router.use(authMiddleware);

router.post('/appointments', createAppointment);
router.get('/appointments/:id', getAppointmentById);
router.get('/my-appointments', getMyAppointments);
router.get('/my-appointments/upcoming', getUpcomingAppointments);
router.get('/my-appointments/past', getPastAppointments);
router.get('/clinics/:clinicId/appointments', getClinicAppointments);
router.put('/appointments/:id', updateAppointment);
router.post('/appointments/:id/cancel', cancelAppointment);
router.delete('/appointments/:id', deleteAppointment);

export default router;
