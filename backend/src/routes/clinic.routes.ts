import { Router } from 'express';
import {
  createClinic,
  getAllClinics,
  getClinicById,
  getClinicsByCity,
  getNearbyClinics,
  getMyClinics,
  updateClinic,
  deleteClinic,
  createService,
  getClinicServices,
  updateService,
  deleteService
} from '../controllers/clinic.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/clinics', getAllClinics);
router.get('/clinics/nearby', getNearbyClinics);
router.get('/clinics/city/:city', getClinicsByCity);
router.get('/clinics/:id', getClinicById);
router.get('/clinics/:clinicId/services', getClinicServices);

// Protected routes (require authentication) - auth middleware applied individually
// Clinic management (vetcompany only)
router.post('/clinics', authMiddleware, requireRole('vetcompany'), createClinic);
router.get('/my-clinics', authMiddleware, getMyClinics);
router.put('/clinics/:id', authMiddleware, updateClinic);
router.delete('/clinics/:id', authMiddleware, deleteClinic);

// Service management (vetcompany only)
router.post('/clinics/:clinicId/services', authMiddleware, requireRole('vetcompany'), createService);
router.put('/services/:serviceId', authMiddleware, updateService);
router.delete('/services/:serviceId', authMiddleware, deleteService);

export default router;
