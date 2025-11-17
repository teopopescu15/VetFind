import { Router } from 'express';
import { createCompanyController } from '../controllers/company.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();
const companyController = createCompanyController();

// Routes are matched in order - specific routes must come before parameterized routes

// Protected user-specific route (must come before GET /:id)
router.get('/my-company', authMiddleware, companyController.getMyCompany); // Get current user's company

// Root path handlers
router.route('/')
  .get(companyController.search) // Public: Get all companies or search with filters
  .post(authMiddleware, requireRole('vetcompany'), companyController.create); // Protected: Create company

// Parameterized routes (must come after specific routes)
router.route('/:id')
  .get(companyController.getById) // Public: Get company by ID
  .put(authMiddleware, companyController.update) // Protected: Update company
  .delete(authMiddleware, companyController.delete); // Protected: Delete company

// Photo management routes
router.post('/:id/photos', authMiddleware, companyController.uploadPhoto); // Upload photo
router.delete('/:id/photos', authMiddleware, companyController.deletePhoto); // Delete photo

export default router;
