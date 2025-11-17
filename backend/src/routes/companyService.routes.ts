import { Router } from 'express';
import { createCompanyServiceController } from '../controllers/companyService.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const serviceController = createCompanyServiceController();

// Service template route (public) - mounted at /api/services/templates
router.get('/templates', serviceController.getTemplates);

// Company service routes - mounted at /api/companies/:companyId/services
// Public routes
router.get('/:companyId/services', serviceController.getServices); // Get all services for a company

// Protected routes (require authentication and company ownership)
router.post('/:companyId/services', authMiddleware, serviceController.createService); // Create service
router.post('/:companyId/services/bulk', authMiddleware, serviceController.bulkCreateServices); // Bulk create services
router.put('/:companyId/services/:serviceId', authMiddleware, serviceController.updateService); // Update service
router.delete('/:companyId/services/:serviceId', authMiddleware, serviceController.deleteService); // Delete service

export default router;
