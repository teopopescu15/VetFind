import { pool } from '../config/database';
import { QueryResult } from 'pg';

export interface Clinic {
  id?: number;
  owner_id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: any; // JSONB
  photo_urls?: any; // JSONB
  created_at?: Date;
  updated_at?: Date;
}

export interface Service {
  id?: number;
  clinic_id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  created_at?: Date;
  updated_at?: Date;
}

// Factory function for clinic operations
export const createClinicModel = () => {
  return {
    // Create a new clinic
    async create(clinic: Clinic): Promise<number> {
      const result: QueryResult = await pool.query(
        `INSERT INTO clinics (owner_id, name, description, address, city, state, zip_code, phone, email, latitude, longitude, opening_hours, photo_urls)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          clinic.owner_id,
          clinic.name,
          clinic.description || null,
          clinic.address,
          clinic.city,
          clinic.state,
          clinic.zip_code,
          clinic.phone,
          clinic.email,
          clinic.latitude || null,
          clinic.longitude || null,
          clinic.opening_hours ? JSON.stringify(clinic.opening_hours) : null,
          clinic.photo_urls ? JSON.stringify(clinic.photo_urls) : null
        ]
      );
      return result.rows[0].id;
    },

    // Get clinic by ID
    async findById(id: number): Promise<Clinic | null> {
      const result: QueryResult = await pool.query(
        'SELECT * FROM clinics WHERE id = $1',
        [id]
      );
      return result.rows.length > 0 ? (result.rows[0] as Clinic) : null;
    },

    // Get all clinics
    async findAll(limit: number = 50, offset: number = 0): Promise<Clinic[]> {
      const result: QueryResult = await pool.query(
        'SELECT * FROM clinics ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      return result.rows as Clinic[];
    },

    // Get clinics by owner
    async findByOwner(ownerId: number): Promise<Clinic[]> {
      const result: QueryResult = await pool.query(
        'SELECT * FROM clinics WHERE owner_id = $1 ORDER BY created_at DESC',
        [ownerId]
      );
      return result.rows as Clinic[];
    },

    // Search clinics by city
    async findByCity(city: string): Promise<Clinic[]> {
      const result: QueryResult = await pool.query(
        'SELECT * FROM clinics WHERE city ILIKE $1 ORDER BY name ASC',
        [`%${city}%`]
      );
      return result.rows as Clinic[];
    },

    // Find nearby clinics (within radius)
    async findNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<Clinic[]> {
      // Haversine formula for distance calculation
      const result: QueryResult = await pool.query(
        `SELECT *,
         (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
         FROM clinics
         WHERE (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) < $3
         ORDER BY distance ASC`,
        [latitude, longitude, radiusKm]
      );
      return result.rows as Clinic[];
    },

    // Update clinic
    async update(id: number, clinic: Partial<Clinic>): Promise<boolean> {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(clinic).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'owner_id' && key !== 'created_at' && key !== 'updated_at') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) return false;

      values.push(id);
      const result: QueryResult = await pool.query(
        `UPDATE clinics SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
        values
      );

      return result.rowCount !== null && result.rowCount > 0;
    },

    // Delete clinic
    async delete(id: number): Promise<boolean> {
      const result: QueryResult = await pool.query(
        'DELETE FROM clinics WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    }
  };
};

// Factory function for service operations
export const createServiceModel = () => {
  return {
    // Create a new service
    async create(service: Service): Promise<number> {
      const result: QueryResult = await pool.query(
        `INSERT INTO services (clinic_id, name, description, price, duration_minutes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          service.clinic_id,
          service.name,
          service.description || null,
          service.price,
          service.duration_minutes || null
        ]
      );
      return result.rows[0].id;
    },

    // Get service by ID
    async findById(id: number): Promise<Service | null> {
      const result: QueryResult = await pool.query(
        'SELECT * FROM services WHERE id = $1',
        [id]
      );
      return result.rows.length > 0 ? (result.rows[0] as Service) : null;
    },

    // Get services by clinic
    async findByClinic(clinicId: number): Promise<Service[]> {
      const result: QueryResult = await pool.query(
        'SELECT * FROM services WHERE clinic_id = $1 ORDER BY name ASC',
        [clinicId]
      );
      return result.rows as Service[];
    },

    // Update service
    async update(id: number, service: Partial<Service>): Promise<boolean> {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(service).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'clinic_id' && key !== 'created_at' && key !== 'updated_at') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) return false;

      values.push(id);
      const result: QueryResult = await pool.query(
        `UPDATE services SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
        values
      );

      return result.rowCount !== null && result.rowCount > 0;
    },

    // Delete service
    async delete(id: number): Promise<boolean> {
      const result: QueryResult = await pool.query(
        'DELETE FROM services WHERE id = $1',
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    }
  };
};
