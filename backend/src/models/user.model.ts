import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { User, CreateUserDTO, UpdateUserDTO, UserResponse } from '../types/user.types';

// Object literal with static-like methods for user operations
export const UserModel = {
  // Create a new user
  async create(userData: CreateUserDTO): Promise<UserResponse> {
    const { name, email, password, role } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (
        name, email, password, role,
        street, street_number, building, apartment,
        city, county, postal_code, country,
        latitude, longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, name, email, role,
        street, street_number, building, apartment,
        city, county, postal_code, country,
        latitude, longitude,
        created_at, updated_at
    `;

    const values = [
      name,
      email,
      hashedPassword,
      role,
      userData.street || null,
      userData.street_number || null,
      userData.building || null,
      userData.apartment || null,
      userData.city || null,
      userData.county || null,
      userData.postal_code || null,
      userData.country || 'Romania',
      userData.latitude ?? null,
      userData.longitude ?? null,
    ];

    try {
      const result = await pool.query(query, values);
      return this._deserializeUser(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  },

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] ? this._deserializeUserWithPassword(result.rows[0]) : null;
  },

  // Find user by ID
  async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this._deserializeUserWithPassword(result.rows[0]) : null;
  },

  // Get all users (with pagination)
  async findAll(limit: number = 10, offset: number = 0): Promise<UserResponse[]> {
    const query = `
      SELECT id, name, email, role,
        street, street_number, building, apartment,
        city, county, postal_code, country,
        latitude, longitude,
        created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows.map((row: any) => this._deserializeUser(row));
  },

  // Update user
  async update(id: number, userData: UpdateUserDTO): Promise<UserResponse | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    if (userData.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(userData.name);
      paramCount++;
    }

    if (userData.email !== undefined) {
      fields.push(`email = $${paramCount}`);
      values.push(userData.email);
      paramCount++;
    }

    if (userData.password !== undefined) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      fields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (userData.role !== undefined) {
      fields.push(`role = $${paramCount}`);
      values.push(userData.role);
      paramCount++;
    }

    // Address fields
    if (userData.street !== undefined) {
      fields.push(`street = $${paramCount}`);
      values.push(userData.street);
      paramCount++;
    }
    if (userData.street_number !== undefined) {
      fields.push(`street_number = $${paramCount}`);
      values.push(userData.street_number);
      paramCount++;
    }
    if (userData.building !== undefined) {
      fields.push(`building = $${paramCount}`);
      values.push(userData.building);
      paramCount++;
    }
    if (userData.apartment !== undefined) {
      fields.push(`apartment = $${paramCount}`);
      values.push(userData.apartment);
      paramCount++;
    }
    if (userData.city !== undefined) {
      fields.push(`city = $${paramCount}`);
      values.push(userData.city);
      paramCount++;
    }
    if (userData.county !== undefined) {
      fields.push(`county = $${paramCount}`);
      values.push(userData.county);
      paramCount++;
    }
    if (userData.postal_code !== undefined) {
      fields.push(`postal_code = $${paramCount}`);
      values.push(userData.postal_code);
      paramCount++;
    }
    if (userData.country !== undefined) {
      fields.push(`country = $${paramCount}`);
      values.push(userData.country);
      paramCount++;
    }
    if (userData.latitude !== undefined) {
      fields.push(`latitude = $${paramCount}`);
      values.push(userData.latitude);
      paramCount++;
    }
    if (userData.longitude !== undefined) {
      fields.push(`longitude = $${paramCount}`);
      values.push(userData.longitude);
      paramCount++;
    }

    if (fields.length === 0) {
      const u = await this.findById(id);
      if (!u) return null;
      // Strip password and normalize numeric fields
      const { password: _pw, ...rest } = u as any;
      return this._deserializeUser(rest);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role,
        street, street_number, building, apartment,
        city, county, postal_code, country,
        latitude, longitude,
        created_at, updated_at
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0] ? this._deserializeUser(result.rows[0]) : null;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  },

  // Delete user
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  },

  // Verify password
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // Get users by role
  async findByRole(role: 'user' | 'vetcompany', limit: number = 10, offset: number = 0): Promise<UserResponse[]> {
    const query = `
      SELECT id, name, email, role,
        street, street_number, building, apartment,
        city, county, postal_code, country,
        latitude, longitude,
        created_at, updated_at
      FROM users
      WHERE role = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [role, limit, offset]);
    return result.rows.map((row: any) => this._deserializeUser(row));
  },

  // Count total users
  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM users';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  },

  // Search users by name or email
  async search(searchTerm: string, limit: number = 10, offset: number = 0): Promise<UserResponse[]> {
    const query = `
      SELECT id, name, email, role,
        street, street_number, building, apartment,
        city, county, postal_code, country,
        latitude, longitude,
        created_at, updated_at
      FROM users
      WHERE name ILIKE $1 OR email ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [`%${searchTerm}%`, limit, offset]);
    return result.rows.map((row: any) => this._deserializeUser(row));
  },

  _deserializeUser(row: any): UserResponse {
    return {
      ...row,
      latitude: row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : undefined,
      longitude: row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : undefined,
    };
  },

  _deserializeUserWithPassword(row: any): User {
    return {
      ...row,
      latitude: row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : undefined,
      longitude: row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : undefined,
    };
  },
};