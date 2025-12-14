import { Request, Response } from 'express';
import { CompanyServiceModel } from '../models/companyService.model';
import { pool } from '../config/database';

/**
 * Get all active services for a company
 * GET /api/companies/:companyId/services
 */
export const getCompanyServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = parseInt(req.params.companyId);

    if (isNaN(companyId)) {
      res.status(400).json({ error: 'Invalid company ID' });
      return;
    }

    // Verify company exists
    const companyCheck = await pool.query('SELECT id FROM companies WHERE id = $1', [companyId]);
    if (companyCheck.rows.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Get all active services for the company
    const services = await CompanyServiceModel.findByCompanyId(companyId);

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error: any) {
    console.error('Error fetching company services:', error);
    res.status(500).json({ error: 'Failed to fetch company services' });
  }
};

/**
 * Get single service details with company information
 * GET /api/services/:id
 */
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const serviceId = parseInt(req.params.id);

    if (isNaN(serviceId)) {
      res.status(400).json({ error: 'Invalid service ID' });
      return;
    }

    // Get service with company details using JOIN
    const query = `
      SELECT
        cs.*,
        c.name as company_name,
        c.address as company_address,
        c.phone as company_phone,
        c.photo_url as company_photo_url
      FROM company_services cs
      JOIN companies c ON cs.company_id = c.id
      WHERE cs.id = $1 AND cs.is_active = true
    `;

    const result = await pool.query(query, [serviceId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error fetching service details:', error);
    res.status(500).json({ error: 'Failed to fetch service details' });
  }
};
