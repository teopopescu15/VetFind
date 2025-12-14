import { Router } from 'express';
import { getCompanyServices, getServiceById } from '../controllers/services';

const router = Router();

// GET /api/companies/:companyId/services - List all active services for a company
router.get('/companies/:companyId/services', getCompanyServices);

// GET /api/services/:id - Get single service details
router.get('/services/:id', getServiceById);

export default router;
