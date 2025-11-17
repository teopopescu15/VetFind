import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { CreateUserDTO, UpdateUserDTO } from '../types/user.types';

// Factory function to create user controller
export const createUserController = () => {
  return {
    // Get all users
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        const users = await UserModel.findAll(limit, offset);
        const total = await UserModel.count();

        res.status(200).json({
          success: true,
          data: users,
          pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        next(error);
      }
    },

    // Get user by ID
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseInt(req.params.id);
        const user = await UserModel.findById(id);

        if (!user) {
          res.status(404).json({
            success: false,
            message: 'User not found'
          });
          return;
        }

        // Remove password from response
        const { password, ...userResponse } = user;

        res.status(200).json({
          success: true,
          data: userResponse
        });
      } catch (error) {
        next(error);
      }
    },

    // Create new user (registration)
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const userData: CreateUserDTO = req.body;

        // Validate required fields
        if (!userData.name || !userData.email || !userData.password) {
          res.status(400).json({
            success: false,
            message: 'Name, email, and password are required'
          });
          return;
        }

        // Validate role
        if (!userData.role || !['user', 'vetcompany'].includes(userData.role)) {
          userData.role = 'user'; // Default role
        }

        const newUser = await UserModel.create(userData);

        res.status(201).json({
          success: true,
          data: newUser,
          message: 'User created successfully'
        });
      } catch (error: any) {
        if (error.message === 'User with this email already exists') {
          res.status(409).json({
            success: false,
            message: error.message
          });
          return;
        }
        next(error);
      }
    },

    // Update user
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseInt(req.params.id);
        const userData: UpdateUserDTO = req.body;

        const updatedUser = await UserModel.update(id, userData);

        if (!updatedUser) {
          res.status(404).json({
            success: false,
            message: 'User not found'
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: updatedUser,
          message: 'User updated successfully'
        });
      } catch (error: any) {
        if (error.message === 'User with this email already exists') {
          res.status(409).json({
            success: false,
            message: error.message
          });
          return;
        }
        next(error);
      }
    },

    // Delete user
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseInt(req.params.id);
        const deleted = await UserModel.delete(id);

        if (!deleted) {
          res.status(404).json({
            success: false,
            message: 'User not found'
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: 'User deleted successfully'
        });
      } catch (error) {
        next(error);
      }
    },

    // Get users by role
    async getByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const role = req.params.role as 'user' | 'vetcompany';
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!['user', 'vetcompany'].includes(role)) {
          res.status(400).json({
            success: false,
            message: 'Invalid role. Must be "user" or "vetcompany"'
          });
          return;
        }

        const users = await UserModel.findByRole(role, limit, offset);

        res.status(200).json({
          success: true,
          data: users,
          filter: { role }
        });
      } catch (error) {
        next(error);
      }
    },

    // Search users
    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const searchTerm = req.query.q as string;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!searchTerm) {
          res.status(400).json({
            success: false,
            message: 'Search term is required'
          });
          return;
        }

        const users = await UserModel.search(searchTerm, limit, offset);

        res.status(200).json({
          success: true,
          data: users,
          search: searchTerm
        });
      } catch (error) {
        next(error);
      }
    }
  };
};

// Export singleton instance
export const UserController = createUserController();