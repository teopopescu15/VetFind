import { Request, Response } from 'express';
import { createReviewModel, Review } from '../models/review.model';
import { createClinicModel } from '../models/clinic.model';
import { createAppointmentModel } from '../models/appointment.model';

const reviewModel = createReviewModel();
const clinicModel = createClinicModel();
const appointmentModel = createAppointmentModel();

// Factory function for review controller
export const createReviewController = () => {
  return {
    // Create a new review
    async createReview(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        const clinicId = parseInt(req.params.clinicId);
        const clinic = await clinicModel.findById(clinicId);

        if (!clinic) {
          res.status(404).json({ success: false, message: 'Clinic not found' });
          return;
        }

        // Ensure appointment_id is provided and valid
        const appointmentId = parseInt(req.body.appointment_id);
        if (!appointmentId) {
          res.status(400).json({ success: false, message: 'appointment_id is required' });
          return;
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
          res.status(404).json({ success: false, message: 'Appointment not found' });
          return;
        }

        // Appointment must belong to the requesting user and be completed
        if (appointment.user_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to review this appointment' });
          return;
        }

        if (appointment.status !== 'completed') {
          res.status(400).json({ success: false, message: 'Can only review completed appointments' });
          return;
        }

        if (appointment.company_id !== clinicId) {
          res.status(400).json({ success: false, message: 'Appointment does not belong to this clinic/company' });
          return;
        }

        // Ensure one review per appointment
        const exists = await reviewModel.hasReviewForAppointment(appointmentId);
        if (exists) {
          res.status(400).json({ success: false, message: 'A review already exists for this appointment' });
          return;
        }

        const reviewData: Review = {
          company_id: clinicId,
          user_id: userId,
          appointment_id: appointmentId,
          rating: req.body.rating,
          comment: req.body.comment
        } as any;

        // Validate rating
        if (reviewData.rating < 1 || reviewData.rating > 5) {
          res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
          return;
        }

        const reviewId = await reviewModel.create(reviewData);
        const review = await reviewModel.findById(reviewId);

        res.status(201).json({
          success: true,
          message: 'Review created successfully',
          data: review
        });
      } catch (error: any) {
        console.error('Create review error:', error, error?.stack);
        res.status(500).json({
          success: false,
          message: 'Failed to create review',
          error: error.message
        });
      }
    },

    // Get reviews for a clinic
    async getClinicReviews(req: Request, res: Response): Promise<void> {
      try {
        const clinicId = parseInt(req.params.clinicId);
        const reviews = await reviewModel.findByClinic(clinicId);
        const avgRating = await reviewModel.getAverageRating(clinicId);

        res.status(200).json({
          success: true,
          data: reviews,
          total: reviews.length,
          avg_rating: avgRating
        });
      } catch (error: any) {
        console.error('Get clinic reviews error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch reviews',
          error: error.message
        });
      }
    },

    // Get user's reviews
    async getMyReviews(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        const reviews = await reviewModel.findByUser(userId);
        res.status(200).json({
          success: true,
          data: reviews,
          total: reviews.length
        });
      } catch (error: any) {
        console.error('Get my reviews error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch reviews',
          error: error.message
        });
      }
    },

    // Update review
    async updateReview(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const reviewId = parseInt(req.params.id);

        const review = await reviewModel.findById(reviewId);
        if (!review) {
          res.status(404).json({ success: false, message: 'Review not found' });
          return;
        }

        if (review.user_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to update this review' });
          return;
        }

        // Validate rating if provided
        if (req.body.rating && (req.body.rating < 1 || req.body.rating > 5)) {
          res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
          return;
        }

        await reviewModel.update(reviewId, req.body);
        const updatedReview = await reviewModel.findById(reviewId);

        res.status(200).json({
          success: true,
          message: 'Review updated successfully',
          data: updatedReview
        });
      } catch (error: any) {
        console.error('Update review error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update review',
          error: error.message
        });
      }
    },

    // Delete review
    async deleteReview(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const reviewId = parseInt(req.params.id);

        const review = await reviewModel.findById(reviewId);
        if (!review) {
          res.status(404).json({ success: false, message: 'Review not found' });
          return;
        }

        if (review.user_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
          return;
        }

        await reviewModel.delete(reviewId);
        res.status(200).json({
          success: true,
          message: 'Review deleted successfully'
        });
      } catch (error: any) {
        console.error('Delete review error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete review',
          error: error.message
        });
      }
    }
  };
};

// Export controller instance
const controller = createReviewController();
export const createReview = controller.createReview.bind(controller);
export const getClinicReviews = controller.getClinicReviews.bind(controller);
export const getMyReviews = controller.getMyReviews.bind(controller);
export const updateReview = controller.updateReview.bind(controller);
export const deleteReview = controller.deleteReview.bind(controller);
