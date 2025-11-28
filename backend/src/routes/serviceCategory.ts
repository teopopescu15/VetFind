import { Router } from 'express';
import { createServiceCategoryController } from '../controllers/serviceCategory';

const router = Router();
const serviceCategoryController = createServiceCategoryController();

// Public routes - specific routes must come before parameterized routes

// Get all categories with their specializations (hierarchical data)
router.get('/with-specializations', serviceCategoryController.getAllWithSpecializations);

// Get multiple specializations by IDs (for Step 4 pricing form)
router.post('/specializations/by-ids', serviceCategoryController.getSpecializationsByIds);

// Get a single specialization by ID
router.get('/specializations/:id', serviceCategoryController.getSpecializationById);

// Get all categories (flat list)
router.get('/', serviceCategoryController.getAll);

// Get single category by ID (with its specializations)
router.get('/:id', serviceCategoryController.getById);

// Get specializations for a specific category
router.get('/:id/specializations', serviceCategoryController.getSpecializationsByCategory);

export default router;
