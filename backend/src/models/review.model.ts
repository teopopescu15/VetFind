import { pool } from '../config/database';
import { QueryResult } from 'pg';

export interface Review {
  id?: number;
  company_id: number;
  user_id: number;
  appointment_id?: number;
  rating: number; // 1-5
  comment?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Factory function for review operations
export const createReviewModel = () => {
  return {
    // Create a new review
    async create(review: Review): Promise<number> {
      // Basic validation to ensure required foreign keys are present
      if (!review.company_id || !review.user_id || !review.appointment_id) {
        throw new Error('Missing required fields: company_id, user_id and appointment_id');
      }

      const result: QueryResult = await pool.query(
        `INSERT INTO reviews (company_id, user_id, appointment_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          review.company_id,
          review.user_id,
          review.appointment_id,
          review.rating,
          review.comment || null
        ]
      );
      return result.rows[0].id;
    },

    // Get review by ID
    async findById(id: number): Promise<Review | null> {
      const result: QueryResult = await pool.query(
        'SELECT * FROM reviews WHERE id = $1',
        [id]
      );
      return result.rows.length > 0 ? (result.rows[0] as Review) : null;
    },

    // Get reviews by clinic with user info
    async findByClinic(clinicId: number): Promise<any[]> {
      const result: QueryResult = await pool.query(
        `SELECT r.*, u.name as user_name, u.email as user_email
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.company_id = $1
         ORDER BY r.created_at DESC`,
        [clinicId]
      );
      return result.rows;
    },

    // Get reviews by user
    async findByUser(userId: number): Promise<Review[]> {
      const result: QueryResult = await pool.query(
        'SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows as Review[];
    },

    // Get average rating for a clinic
    async getAverageRating(clinicId: number): Promise<number> {
      const result: QueryResult = await pool.query(
        'SELECT AVG(rating) as avg_rating FROM reviews WHERE company_id = $1',
        [clinicId]
      );
      return result.rows[0]?.avg_rating || 0;
    },

    // Get review count for a clinic
    async getReviewCount(clinicId: number): Promise<number> {
      const result: QueryResult = await pool.query(
        'SELECT COUNT(*) as count FROM reviews WHERE company_id = $1',
        [clinicId]
      );
      return parseInt(result.rows[0]?.count) || 0;
    },

    // Check if user has already reviewed a clinic
    async hasUserReviewed(clinicId: number, userId: number): Promise<boolean> {
      const result: QueryResult = await pool.query(
        'SELECT id FROM reviews WHERE company_id = $1 AND user_id = $2',
        [clinicId, userId]
      );
      return result.rows.length > 0;
    },

    // Check if a review exists for a specific appointment
    async hasReviewForAppointment(appointmentId: number): Promise<boolean> {
      const result: QueryResult = await pool.query(
        'SELECT id FROM reviews WHERE appointment_id = $1',
        [appointmentId]
      );
      return result.rows.length > 0;
    },

    // Update review
    async update(id: number, review: Partial<Review>): Promise<boolean> {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(review).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'company_id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) return false;

      values.push(id);
      const result: QueryResult = await pool.query(
        `UPDATE reviews SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
        values
      );

      return result.rowCount !== null && result.rowCount > 0;
    },

    // Delete review
    async delete(id: number): Promise<boolean> {
      const result: QueryResult = await pool.query(
        'DELETE FROM reviews WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    }
  };
};
