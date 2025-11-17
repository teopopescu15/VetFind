import { Router } from 'express';
import {
  createReview,
  getClinicReviews,
  getMyReviews,
  updateReview,
  deleteReview
} from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/clinics/:clinicId/reviews', getClinicReviews);

// Protected routes (require authentication)
router.use(authMiddleware);

router.post('/clinics/:clinicId/reviews', createReview);
router.get('/my-reviews', getMyReviews);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

export default router;
