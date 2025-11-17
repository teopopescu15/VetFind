import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
// Use singleton instance (no instantiation needed)

// User CRUD routes
router.get('/', UserController.getAll);
router.get('/search', UserController.search);
router.get('/role/:role', UserController.getByRole);
router.get('/:id', UserController.getById);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

export default router;