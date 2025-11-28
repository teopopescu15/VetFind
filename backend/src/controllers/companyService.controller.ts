import { Request, Response, NextFunction } from 'express';
import { CompanyServiceModel } from '../models/companyService.model';
import { CompanyModel } from '../models/company.model';
import { CreateServiceDTO, UpdateServiceDTO } from '../types/companyService.types';

// Extended Request with user from auth middleware
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Factory function to create company service controller
export const createCompanyServiceController = () => {
  return {
    /**
     * Create a new service
     * POST /api/companies/:companyId/services
     * Requires: authentication, company ownership
     */
    async createService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
      try {
        const userId = req.user?.id;
        const companyId = parseInt(req.params.companyId);

        if (!userId) {
          res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated',
          });
          return;
        }

        if (isNaN(companyId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid company ID',
          });
          return;
        }

        // Check company ownership
        const company = await CompanyModel.findById(companyId);
        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Company not found',
          });
          return;
        }

        if (company.user_id !== userId) {
          res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this company',
          });
          return;
        }

        // Validate required fields
        const { category, service_name, price_min, price_max } = req.body;

        if (!category || !service_name || price_min === undefined || price_max === undefined) {
          res.status(400).json({
            success: false,
            message: 'Missing required fields: category, service_name, price_min, price_max',
          });
          return;
        }

        // Validate price range
        if (price_min < 0 || price_max < price_min) {
          res.status(400).json({
            success: false,
            message: 'Invalid price range: price_min must be >= 0 and price_max must be >= price_min',
          });
          return;
        }

        const serviceData: CreateServiceDTO = {
          company_id: companyId,
          category,
          service_name,
          description: req.body.description,
          specialization_id: req.body.specialization_id,
          category_id: req.body.category_id,
          price_min,
          price_max,
          duration_minutes: req.body.duration_minutes,
          is_custom: req.body.is_custom !== undefined ? req.body.is_custom : !req.body.specialization_id,
        };

        const service = await CompanyServiceModel.create(serviceData);

        res.status(201).json({
          success: true,
          message: 'Service created successfully',
          data: service,
        });
      } catch (error: any) {
        console.error('Error creating service:', error);
        next(error);
      }
    },

    /**
     * Get all services for a company
     * GET /api/companies/:companyId/services
     * Public endpoint
     */
    async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const companyId = parseInt(req.params.companyId);

        if (isNaN(companyId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid company ID',
          });
          return;
        }

        // Optional: filter by category
        const category = req.query.category as any;

        const services = category
          ? await CompanyServiceModel.findByCategory(companyId, category)
          : await CompanyServiceModel.findByCompanyId(companyId);

        res.status(200).json({
          success: true,
          count: services.length,
          data: services,
        });
      } catch (error: any) {
        console.error('Error fetching services:', error);
        next(error);
      }
    },

    /**
     * Update a service
     * PUT /api/companies/:companyId/services/:serviceId
     * Requires: authentication, company ownership
     */
    async updateService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
      try {
        const userId = req.user?.id;
        const companyId = parseInt(req.params.companyId);
        const serviceId = parseInt(req.params.serviceId);

        if (!userId) {
          res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated',
          });
          return;
        }

        if (isNaN(companyId) || isNaN(serviceId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid company ID or service ID',
          });
          return;
        }

        // Check company ownership
        const company = await CompanyModel.findById(companyId);
        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Company not found',
          });
          return;
        }

        if (company.user_id !== userId) {
          res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this company',
          });
          return;
        }

        // Check if service exists and belongs to company
        const existingService = await CompanyServiceModel.findById(serviceId);
        if (!existingService) {
          res.status(404).json({
            success: false,
            message: 'Service not found',
          });
          return;
        }

        if (existingService.company_id !== companyId) {
          res.status(403).json({
            success: false,
            message: 'Forbidden: Service does not belong to this company',
          });
          return;
        }

        // Build update DTO
        const updateData: UpdateServiceDTO = {};

        if (req.body.category !== undefined) updateData.category = req.body.category;
        if (req.body.service_name !== undefined) updateData.service_name = req.body.service_name;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.specialization_id !== undefined) updateData.specialization_id = req.body.specialization_id;
        if (req.body.category_id !== undefined) updateData.category_id = req.body.category_id;
        if (req.body.price_min !== undefined) updateData.price_min = req.body.price_min;
        if (req.body.price_max !== undefined) updateData.price_max = req.body.price_max;
        if (req.body.duration_minutes !== undefined) updateData.duration_minutes = req.body.duration_minutes;
        if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;

        const updatedService = await CompanyServiceModel.update(serviceId, updateData);

        res.status(200).json({
          success: true,
          message: 'Service updated successfully',
          data: updatedService,
        });
      } catch (error: any) {
        console.error('Error updating service:', error);
        next(error);
      }
    },

    /**
     * Delete a service (soft delete)
     * DELETE /api/companies/:companyId/services/:serviceId
     * Requires: authentication, company ownership
     */
    async deleteService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
      try {
        const userId = req.user?.id;
        const companyId = parseInt(req.params.companyId);
        const serviceId = parseInt(req.params.serviceId);

        if (!userId) {
          res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated',
          });
          return;
        }

        if (isNaN(companyId) || isNaN(serviceId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid company ID or service ID',
          });
          return;
        }

        // Check company ownership
        const company = await CompanyModel.findById(companyId);
        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Company not found',
          });
          return;
        }

        if (company.user_id !== userId) {
          res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this company',
          });
          return;
        }

        // Check if service exists and belongs to company
        const existingService = await CompanyServiceModel.findById(serviceId);
        if (!existingService) {
          res.status(404).json({
            success: false,
            message: 'Service not found',
          });
          return;
        }

        if (existingService.company_id !== companyId) {
          res.status(403).json({
            success: false,
            message: 'Forbidden: Service does not belong to this company',
          });
          return;
        }

        await CompanyServiceModel.delete(serviceId);

        res.status(200).json({
          success: true,
          message: 'Service deleted successfully',
        });
      } catch (error: any) {
        console.error('Error deleting service:', error);
        next(error);
      }
    },

    /**
     * Bulk create services from templates
     * POST /api/companies/:companyId/services/bulk
     * Requires: authentication, company ownership
     */
    async bulkCreateServices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
      try {
        console.log('BULK CREATE - Full request body:', JSON.stringify(req.body, null, 2));
        const userId = req.user?.id;
        const companyId = parseInt(req.params.companyId);

        if (!userId) {
          res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated',
          });
          return;
        }

        if (isNaN(companyId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid company ID',
          });
          return;
        }

        // Check company ownership
        const company = await CompanyModel.findById(companyId);
        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Company not found',
          });
          return;
        }

        if (company.user_id !== userId) {
          res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this company',
          });
          return;
        }

        const { services } = req.body;

        console.log('DEBUG - Raw request body services:', JSON.stringify(services, null, 2));

        if (!services || !Array.isArray(services) || services.length === 0) {
          res.status(400).json({
            success: false,
            message: 'Services array is required and must not be empty',
          });
          return;
        }

        // Validate each service
        for (const service of services) {
          if (!service.category || !service.service_name || service.price_min === undefined || service.price_max === undefined) {
            res.status(400).json({
              success: false,
              message: 'Each service must have category, service_name, price_min, and price_max',
            });
            return;
          }

          if (service.price_min < 0 || service.price_max < service.price_min) {
            res.status(400).json({
              success: false,
              message: 'Invalid price range in one or more services',
            });
            return;
          }
        }

        // Add company_id to each service
        const servicesWithCompanyId: CreateServiceDTO[] = services.map(service => ({
          company_id: companyId,
          category: service.category,
          service_name: service.service_name,
          description: service.description,
          specialization_id: service.specialization_id,
          category_id: service.category_id,
          price_min: service.price_min,
          price_max: service.price_max,
          duration_minutes: service.duration_minutes,
          is_custom: service.is_custom !== undefined ? service.is_custom : !service.specialization_id,
        }));

        console.log('DEBUG - Services being sent to model:', JSON.stringify(servicesWithCompanyId, null, 2));

        const createdServices = await CompanyServiceModel.bulkCreate(servicesWithCompanyId);

        res.status(201).json({
          success: true,
          message: `${createdServices.length} services created successfully`,
          data: createdServices,
        });
      } catch (error: any) {
        console.error('Error bulk creating services:', error);
        next(error);
      }
    },

    /**
     * Get service templates
     * GET /api/services/templates
     * Public endpoint
     */
    async getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const category = req.query.category as any;

        const templates = category
          ? CompanyServiceModel.getTemplatesByCategory(category)
          : CompanyServiceModel.getTemplates();

        res.status(200).json({
          success: true,
          count: templates.length,
          data: templates,
        });
      } catch (error: any) {
        console.error('Error fetching service templates:', error);
        next(error);
      }
    },
  };
};
