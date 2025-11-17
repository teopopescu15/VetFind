import { Request, Response, NextFunction } from 'express';

// Factory function to create sample controller
export const createSampleController = () => {
  return {
    // Get all items
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        // This is where you would fetch from database
        const items = [
          { id: 1, name: 'Sample Item 1' },
          { id: 2, name: 'Sample Item 2' },
        ];

        res.status(200).json({
          success: true,
          data: items,
        });
      } catch (error) {
        next(error);
      }
    },

    // Get item by ID
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params;

        // This is where you would fetch from database
        const item = { id, name: `Sample Item ${id}` };

        res.status(200).json({
          success: true,
          data: item,
        });
      } catch (error) {
        next(error);
      }
    },

    // Create new item
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { name } = req.body;

        // This is where you would save to database
        const newItem = { id: Date.now(), name };

        res.status(201).json({
          success: true,
          data: newItem,
        });
      } catch (error) {
        next(error);
      }
    },

    // Update item
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params;
        const { name } = req.body;

        // This is where you would update in database
        const updatedItem = { id, name };

        res.status(200).json({
          success: true,
          data: updatedItem,
        });
      } catch (error) {
        next(error);
      }
    },

    // Delete item
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { id } = req.params;

        // This is where you would delete from database

        res.status(200).json({
          success: true,
          message: `Item with ID ${id} deleted successfully`,
        });
      } catch (error) {
        next(error);
      }
    }
  };
};

// Export singleton instance
export const SampleController = createSampleController();