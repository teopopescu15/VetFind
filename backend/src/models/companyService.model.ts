import { pool } from '../config/database';
import {
  CompanyService,
  CreateServiceDTO,
  UpdateServiceDTO,
  ServiceCategory,
  SERVICE_TEMPLATES,
  ServiceTemplate,
} from '../types/companyService.types';

// Object literal with static-like methods for company service operations
export const CompanyServiceModel = {
  /**
   * Create a new service
   */
  async create(serviceData: CreateServiceDTO): Promise<CompanyService> {
    const {
      company_id,
      category,
      service_name,
      description,
      price_min,
      price_max,
      duration_minutes,
      is_custom = false,
    } = serviceData;

    const query = `
      INSERT INTO company_services (
        company_id, category, service_name, description,
        price_min, price_max, duration_minutes, is_custom
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      company_id,
      category,
      service_name,
      description || null,
      price_min,
      price_max,
      duration_minutes || null,
      is_custom,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23503') {
        // Foreign key violation
        throw new Error('Company not found');
      }
      if (error.code === '23514') {
        // Check constraint violation
        throw new Error('Invalid price range: price_min must be >= 0 and price_max must be >= price_min');
      }
      throw error;
    }
  },

  /**
   * Find service by ID
   */
  async findById(id: number): Promise<CompanyService | null> {
    const query = 'SELECT * FROM company_services WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  },

  /**
   * Find all services for a company
   */
  async findByCompanyId(companyId: number): Promise<CompanyService[]> {
    const query = `
      SELECT * FROM company_services
      WHERE company_id = $1 AND is_active = true
      ORDER BY category, service_name
    `;

    const result = await pool.query(query, [companyId]);
    return result.rows;
  },

  /**
   * Find services by category for a company
   */
  async findByCategory(companyId: number, category: ServiceCategory): Promise<CompanyService[]> {
    const query = `
      SELECT * FROM company_services
      WHERE company_id = $1 AND category = $2 AND is_active = true
      ORDER BY service_name
    `;

    const result = await pool.query(query, [companyId, category]);
    return result.rows;
  },

  /**
   * Update service
   */
  async update(id: number, serviceData: UpdateServiceDTO): Promise<CompanyService> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    if (serviceData.category !== undefined) {
      fields.push(`category = $${paramCount}`);
      values.push(serviceData.category);
      paramCount++;
    }

    if (serviceData.service_name !== undefined) {
      fields.push(`service_name = $${paramCount}`);
      values.push(serviceData.service_name);
      paramCount++;
    }

    if (serviceData.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(serviceData.description);
      paramCount++;
    }

    if (serviceData.price_min !== undefined) {
      fields.push(`price_min = $${paramCount}`);
      values.push(serviceData.price_min);
      paramCount++;
    }

    if (serviceData.price_max !== undefined) {
      fields.push(`price_max = $${paramCount}`);
      values.push(serviceData.price_max);
      paramCount++;
    }

    if (serviceData.duration_minutes !== undefined) {
      fields.push(`duration_minutes = $${paramCount}`);
      values.push(serviceData.duration_minutes);
      paramCount++;
    }

    if (serviceData.is_active !== undefined) {
      fields.push(`is_active = $${paramCount}`);
      values.push(serviceData.is_active);
      paramCount++;
    }

    // Always update updated_at
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) {
      // Only updated_at would be changed
      throw new Error('No fields to update');
    }

    // Add ID as last parameter
    values.push(id);

    const query = `
      UPDATE company_services
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Service not found');
      }

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23514') {
        // Check constraint violation
        throw new Error('Invalid price range: price_min must be >= 0 and price_max must be >= price_min');
      }
      throw error;
    }
  },

  /**
   * Delete service (soft delete - set is_active to false)
   */
  async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE company_services
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  /**
   * Hard delete service (permanent delete)
   */
  async hardDelete(id: number): Promise<boolean> {
    const query = 'DELETE FROM company_services WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  /**
   * Bulk create services
   */
  async bulkCreate(services: CreateServiceDTO[]): Promise<CompanyService[]> {
    if (services.length === 0) {
      return [];
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const createdServices: CompanyService[] = [];

      for (const serviceData of services) {
        const {
          company_id,
          category,
          service_name,
          description,
          price_min,
          price_max,
          duration_minutes,
          is_custom = false,
        } = serviceData;

        const query = `
          INSERT INTO company_services (
            company_id, category, service_name, description,
            price_min, price_max, duration_minutes, is_custom
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;

        const values = [
          company_id,
          category,
          service_name,
          description || null,
          price_min,
          price_max,
          duration_minutes || null,
          is_custom,
        ];

        const result = await client.query(query, values);
        createdServices.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdServices;
    } catch (error: any) {
      await client.query('ROLLBACK');

      if (error.code === '23503') {
        throw new Error('Company not found');
      }
      if (error.code === '23514') {
        throw new Error('Invalid price range in one or more services');
      }

      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get service templates
   */
  getTemplates(): ServiceTemplate[] {
    return SERVICE_TEMPLATES;
  },

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: ServiceCategory): ServiceTemplate[] {
    return SERVICE_TEMPLATES.filter(template => template.category === category);
  },

  /**
   * Count services for a company
   */
  async countByCompanyId(companyId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM company_services
      WHERE company_id = $1 AND is_active = true
    `;

    const result = await pool.query(query, [companyId]);
    return parseInt(result.rows[0].count);
  },
};
