import { Request, Response, NextFunction } from 'express';
import { ServiceCategoryModel } from '../models/serviceCategory';

// Factory function to create service category controller
export const createServiceCategoryController = () => {
  return {
    /**
     * Get all service categories
     * GET /api/service-categories
     * Public endpoint
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const categories = await ServiceCategoryModel.findAll();

        res.status(200).json({
          success: true,
          count: categories.length,
          data: categories,
        });
      } catch (error: any) {
        console.error('Error fetching service categories:', error);
        next(error);
      }
    },

    /**
     * Get all categories with their specializations
     * GET /api/service-categories/with-specializations
     * Public endpoint
     */
    async getAllWithSpecializations(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const categoriesWithSpecializations = await ServiceCategoryModel.findAllWithSpecializations();

        res.status(200).json({
          success: true,
          count: categoriesWithSpecializations.length,
          data: categoriesWithSpecializations,
        });
      } catch (error: any) {
        console.error('Error fetching categories with specializations:', error);
        next(error);
      }
    },

    /**
     * Get a single category by ID
     * GET /api/service-categories/:id
     * Public endpoint
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const categoryId = parseInt(req.params.id);

        if (isNaN(categoryId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid category ID',
          });
          return;
        }

        const category = await ServiceCategoryModel.findByIdWithSpecializations(categoryId);

        if (!category) {
          res.status(404).json({
            success: false,
            message: 'Service category not found',
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: category,
        });
      } catch (error: any) {
        console.error('Error fetching service category by ID:', error);
        next(error);
      }
    },

    /**
     * Get specializations by category ID
     * GET /api/service-categories/:id/specializations
     * Public endpoint
     */
    async getSpecializationsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const categoryId = parseInt(req.params.id);

        if (isNaN(categoryId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid category ID',
          });
          return;
        }

        // First verify the category exists
        const category = await ServiceCategoryModel.findById(categoryId);
        if (!category) {
          res.status(404).json({
            success: false,
            message: 'Service category not found',
          });
          return;
        }

        const specializations = await ServiceCategoryModel.findSpecializationsByCategoryId(categoryId);

        res.status(200).json({
          success: true,
          count: specializations.length,
          data: specializations,
        });
      } catch (error: any) {
        console.error('Error fetching specializations by category:', error);
        next(error);
      }
    },

    /**
     * Get multiple specializations by IDs (for Step 4)
     * POST /api/service-categories/specializations/by-ids
     * Public endpoint
     * Body: { ids: number[] }
     */
    async getSpecializationsByIds(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
          res.status(400).json({
            success: false,
            message: 'ids must be an array of numbers',
          });
          return;
        }

        // Validate all IDs are numbers
        const validIds = ids.filter(id => typeof id === 'number' && !isNaN(id));

        if (validIds.length !== ids.length) {
          res.status(400).json({
            success: false,
            message: 'All ids must be valid numbers',
          });
          return;
        }

        const specializations = await ServiceCategoryModel.findSpecializationsWithCategoryByIds(validIds);

        res.status(200).json({
          success: true,
          count: specializations.length,
          data: specializations,
        });
      } catch (error: any) {
        console.error('Error fetching specializations by IDs:', error);
        next(error);
      }
    },

    /**
     * Get a single specialization by ID
     * GET /api/service-categories/specializations/:id
     * Public endpoint
     */
    async getSpecializationById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const specializationId = parseInt(req.params.id);

        if (isNaN(specializationId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid specialization ID',
          });
          return;
        }

        const specialization = await ServiceCategoryModel.findSpecializationById(specializationId);

        if (!specialization) {
          res.status(404).json({
            success: false,
            message: 'Specialization not found',
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: specialization,
        });
      } catch (error: any) {
        console.error('Error fetching specialization by ID:', error);
        next(error);
      }
    },
  };
};
