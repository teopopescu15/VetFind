import { pool } from '../config/database';
import crypto from 'crypto';

export interface RefreshToken {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRefreshTokenDTO {
  userId: number;
  token: string;
  expiresIn: number; // in seconds
}

// Object literal with methods for refresh token operations
export const RefreshTokenModel = {
  // Helper method to hash a token for storage
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  // Create a new refresh token
  async create(data: CreateRefreshTokenDTO): Promise<RefreshToken> {
    const { userId, token, expiresIn } = data;
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, created_at, updated_at
    `;

    const values = [userId, tokenHash, expiresAt];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      throw error;
    }
  },

  // Find refresh token by the actual token value
  async findByToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = this.hashToken(token);
    const query = `
      SELECT * FROM refresh_tokens
      WHERE token_hash = $1 AND expires_at > NOW()
    `;
    const result = await pool.query(query, [tokenHash]);
    return result.rows[0] || null;
  },

  // Find all refresh tokens for a user
  async findByUserId(userId: number): Promise<RefreshToken[]> {
    const query = `
      SELECT * FROM refresh_tokens
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Delete a specific refresh token
  async deleteByToken(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const query = 'DELETE FROM refresh_tokens WHERE token_hash = $1';
    const result = await pool.query(query, [tokenHash]);
    return (result.rowCount || 0) > 0;
  },

  // Delete all refresh tokens for a user (logout from all devices)
  async deleteAllForUser(userId: number): Promise<number> {
    const query = 'DELETE FROM refresh_tokens WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  },

  // Clean up expired tokens (should be run periodically)
  async deleteExpired(): Promise<number> {
    const query = 'DELETE FROM refresh_tokens WHERE expires_at <= NOW()';
    const result = await pool.query(query);
    return result.rowCount || 0;
  },

  // Verify token is valid and not expired
  async verify(token: string): Promise<RefreshToken | null> {
    return this.findByToken(token);
  },

  // Count active tokens for a user
  async countForUser(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) FROM refresh_tokens
      WHERE user_id = $1 AND expires_at > NOW()
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
};
