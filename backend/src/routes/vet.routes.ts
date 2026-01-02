import { Router } from 'express';
import {
  createReview,
  getClinicReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Reviews for clinics (public list, authenticated create)
// GET  /api/vet/clinics/:clinicId/reviews
// POST /api/vet/clinics/:clinicId/reviews (auth required)
router.get('/clinics/:clinicId/reviews', getClinicReviews);
router.post('/clinics/:clinicId/reviews', authMiddleware, createReview);

// User's reviews
// GET /api/vet/my-reviews
router.get('/my-reviews', authMiddleware, getMyReviews);

// Review management (update/delete) - auth required
// PUT /api/vet/reviews/:id
// DELETE /api/vet/reviews/:id
router.put('/reviews/:id', authMiddleware, updateReview);
router.delete('/reviews/:id', authMiddleware, deleteReview);

export default router;
