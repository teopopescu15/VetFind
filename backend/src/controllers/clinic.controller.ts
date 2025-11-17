import { Request, Response } from 'express';
import { createClinicModel, createServiceModel, Clinic, Service } from '../models/clinic.model';
import { createReviewModel } from '../models/review.model';

const clinicModel = createClinicModel();
const serviceModel = createServiceModel();
const reviewModel = createReviewModel();

// Factory function for clinic controller
export const createClinicController = () => {
  return {
    // Create a new clinic
    async createClinic(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        // Only vetcompany users can create clinics
        if (userRole !== 'vetcompany') {
          res.status(403).json({ 
            success: false, 
            message: 'Only veterinary companies can create clinics' 
          });
          return;
        }

        const clinicData: Clinic = {
          ...req.body,
          owner_id: userId
        };

        const clinicId = await clinicModel.create(clinicData);
        const clinic = await clinicModel.findById(clinicId);

        res.status(201).json({
          success: true,
          message: 'Clinic created successfully',
          data: clinic
        });
      } catch (error: any) {
        console.error('Create clinic error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create clinic',
          error: error.message
        });
      }
    },

    // Get all clinics
    async getAllClinics(req: Request, res: Response): Promise<void> {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const clinics = await clinicModel.findAll(limit, offset);

        // Add average rating for each clinic
        const clinicsWithRatings = await Promise.all(
          clinics.map(async (clinic) => {
            const avgRating = await reviewModel.getAverageRating(clinic.id!);
            const reviewCount = await reviewModel.getReviewCount(clinic.id!);
            return {
              ...clinic,
              avg_rating: avgRating,
              review_count: reviewCount
            };
          })
        );

        res.status(200).json({
          success: true,
          data: clinicsWithRatings,
          total: clinicsWithRatings.length
        });
      } catch (error: any) {
        console.error('Get all clinics error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch clinics',
          error: error.message
        });
      }
    },

    // Get clinic by ID
    async getClinicById(req: Request, res: Response): Promise<void> {
      try {
        const clinicId = parseInt(req.params.id);
        const clinic = await clinicModel.findById(clinicId);

        if (!clinic) {
          res.status(404).json({ success: false, message: 'Clinic not found' });
          return;
        }

        // Add rating info
        const avgRating = await reviewModel.getAverageRating(clinicId);
        const reviewCount = await reviewModel.getReviewCount(clinicId);

        res.status(200).json({
          success: true,
          data: {
            ...clinic,
            avg_rating: avgRating,
            review_count: reviewCount
          }
        });
      } catch (error: any) {
        console.error('Get clinic error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch clinic',
          error: error.message
        });
      }
    },

    // Get clinics by city
    async getClinicsByCity(req: Request, res: Response): Promise<void> {
      try {
        const city = req.params.city;
        const clinics = await clinicModel.findByCity(city);

        const clinicsWithRatings = await Promise.all(
          clinics.map(async (clinic) => {
            const avgRating = await reviewModel.getAverageRating(clinic.id!);
            const reviewCount = await reviewModel.getReviewCount(clinic.id!);
            return {
              ...clinic,
              avg_rating: avgRating,
              review_count: reviewCount
            };
          })
        );

        res.status(200).json({
          success: true,
          data: clinicsWithRatings,
          total: clinicsWithRatings.length
        });
      } catch (error: any) {
        console.error('Get clinics by city error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch clinics',
          error: error.message
        });
      }
    },

    // Get nearby clinics
    async getNearbyClinics(req: Request, res: Response): Promise<void> {
      try {
        const latitude = parseFloat(req.query.latitude as string);
        const longitude = parseFloat(req.query.longitude as string);
        const radius = parseFloat(req.query.radius as string) || 10;

        if (isNaN(latitude) || isNaN(longitude)) {
          res.status(400).json({ success: false, message: 'Invalid coordinates' });
          return;
        }

        const clinics = await clinicModel.findNearby(latitude, longitude, radius);

        const clinicsWithRatings = await Promise.all(
          clinics.map(async (clinic) => {
            const avgRating = await reviewModel.getAverageRating(clinic.id!);
            const reviewCount = await reviewModel.getReviewCount(clinic.id!);
            return {
              ...clinic,
              avg_rating: avgRating,
              review_count: reviewCount
            };
          })
        );

        res.status(200).json({
          success: true,
          data: clinicsWithRatings,
          total: clinicsWithRatings.length
        });
      } catch (error: any) {
        console.error('Get nearby clinics error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch nearby clinics',
          error: error.message
        });
      }
    },

    // Get user's clinics
    async getMyClinics(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        if (!userId) {
          res.status(401).json({ success: false, message: 'User not authenticated' });
          return;
        }

        const clinics = await clinicModel.findByOwner(userId);

        res.status(200).json({
          success: true,
          data: clinics,
          total: clinics.length
        });
      } catch (error: any) {
        console.error('Get my clinics error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch clinics',
          error: error.message
        });
      }
    },

    // Update clinic
    async updateClinic(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const clinicId = parseInt(req.params.id);

        const clinic = await clinicModel.findById(clinicId);
        if (!clinic) {
          res.status(404).json({ success: false, message: 'Clinic not found' });
          return;
        }

        if (clinic.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to update this clinic' });
          return;
        }

        const updated = await clinicModel.update(clinicId, req.body);
        if (!updated) {
          res.status(400).json({ success: false, message: 'No changes made' });
          return;
        }

        const updatedClinic = await clinicModel.findById(clinicId);
        res.status(200).json({
          success: true,
          message: 'Clinic updated successfully',
          data: updatedClinic
        });
      } catch (error: any) {
        console.error('Update clinic error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update clinic',
          error: error.message
        });
      }
    },

    // Delete clinic
    async deleteClinic(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const clinicId = parseInt(req.params.id);

        const clinic = await clinicModel.findById(clinicId);
        if (!clinic) {
          res.status(404).json({ success: false, message: 'Clinic not found' });
          return;
        }

        if (clinic.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to delete this clinic' });
          return;
        }

        await clinicModel.delete(clinicId);
        res.status(200).json({
          success: true,
          message: 'Clinic deleted successfully'
        });
      } catch (error: any) {
        console.error('Delete clinic error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete clinic',
          error: error.message
        });
      }
    },

    // Service operations
    async createService(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;
        const clinicId = parseInt(req.params.clinicId);

        // Only vetcompany users can create services
        if (userRole !== 'vetcompany') {
          res.status(403).json({ 
            success: false, 
            message: 'Only veterinary companies can create services' 
          });
          return;
        }

        const clinic = await clinicModel.findById(clinicId);
        if (!clinic) {
          res.status(404).json({ success: false, message: 'Clinic not found' });
          return;
        }

        if (clinic.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to add services to this clinic' });
          return;
        }

        const serviceData: Service = {
          ...req.body,
          clinic_id: clinicId
        };

        const serviceId = await serviceModel.create(serviceData);
        const service = await serviceModel.findById(serviceId);

        res.status(201).json({
          success: true,
          message: 'Service created successfully',
          data: service
        });
      } catch (error: any) {
        console.error('Create service error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create service',
          error: error.message
        });
      }
    },

    async getClinicServices(req: Request, res: Response): Promise<void> {
      try {
        const clinicId = parseInt(req.params.clinicId);
        const services = await serviceModel.findByClinic(clinicId);

        res.status(200).json({
          success: true,
          data: services,
          total: services.length
        });
      } catch (error: any) {
        console.error('Get clinic services error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch services',
          error: error.message
        });
      }
    },

    async updateService(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const serviceId = parseInt(req.params.serviceId);

        const service = await serviceModel.findById(serviceId);
        if (!service) {
          res.status(404).json({ success: false, message: 'Service not found' });
          return;
        }

        const clinic = await clinicModel.findById(service.clinic_id);
        if (clinic?.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to update this service' });
          return;
        }

        await serviceModel.update(serviceId, req.body);
        const updatedService = await serviceModel.findById(serviceId);

        res.status(200).json({
          success: true,
          message: 'Service updated successfully',
          data: updatedService
        });
      } catch (error: any) {
        console.error('Update service error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update service',
          error: error.message
        });
      }
    },

    async deleteService(req: Request, res: Response): Promise<void> {
      try {
        const userId = (req as any).user?.id;
        const serviceId = parseInt(req.params.serviceId);

        const service = await serviceModel.findById(serviceId);
        if (!service) {
          res.status(404).json({ success: false, message: 'Service not found' });
          return;
        }

        const clinic = await clinicModel.findById(service.clinic_id);
        if (clinic?.owner_id !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to delete this service' });
          return;
        }

        await serviceModel.delete(serviceId);
        res.status(200).json({
          success: true,
          message: 'Service deleted successfully'
        });
      } catch (error: any) {
        console.error('Delete service error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete service',
          error: error.message
        });
      }
    }
  };
};

// Export controller instance
const controller = createClinicController();
export const createClinic = controller.createClinic.bind(controller);
export const getAllClinics = controller.getAllClinics.bind(controller);
export const getClinicById = controller.getClinicById.bind(controller);
export const getClinicsByCity = controller.getClinicsByCity.bind(controller);
export const getNearbyClinics = controller.getNearbyClinics.bind(controller);
export const getMyClinics = controller.getMyClinics.bind(controller);
export const updateClinic = controller.updateClinic.bind(controller);
export const deleteClinic = controller.deleteClinic.bind(controller);
export const createService = controller.createService.bind(controller);
export const getClinicServices = controller.getClinicServices.bind(controller);
export const updateService = controller.updateService.bind(controller);
export const deleteService = controller.deleteService.bind(controller);
