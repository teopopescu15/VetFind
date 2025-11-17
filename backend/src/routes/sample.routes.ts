import { Router } from 'express';
import { SampleController } from '../controllers/sample.controller';

const router = Router();
// Use singleton instance (no instantiation needed)

// Define routes
router.get('/', SampleController.getAll);
router.get('/:id', SampleController.getById);
router.post('/', SampleController.create);
router.put('/:id', SampleController.update);
router.delete('/:id', SampleController.delete);

export default router;