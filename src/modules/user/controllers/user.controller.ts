import { Request, Response } from 'express';
import { createUserSchema } from '../schemas/user.schema';
import { UserService } from '../services/user.service';
import { updateUserSchema } from '../schemas/user.schema';
import { AuthRequest } from '../../../middlewares/auth.middleware';

const userService = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    const body = createUserSchema.parse(req.body);
    const user = await userService.createUser(body);
    return res.status(201).json(user);
  }

  async list(req: Request, res: Response) {
    const users = await userService.listUsers();
    return res.json(users);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: {
          message: 'User ID is required',
          statusCode: 400,
        },
      });
    }
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid user ID format',
          statusCode: 400,
        },
      });
    }
    const user = await userService.getUserById(userId);
    return res.json(user);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: {
          message: 'User ID is required',
          statusCode: 400,
        },
      });
    }
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid user ID format',
          statusCode: 400,
        },
      });
    }
    const body = updateUserSchema.parse(req.body);

    if (req.user && req.user.userId !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only update your own profile',
          statusCode: 403,
        },
      });
    }

    const user = await userService.updateUser(userId, body);
    return res.json(user);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: {
          message: 'User ID is required',
          statusCode: 400,
        },
      });
    }
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid user ID format',
          statusCode: 400,
        },
      });
    }

    if (req.user && req.user.userId !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only delete your own profile',
          statusCode: 403,
        },
      });
    }

    await userService.deleteUser(userId);
    return res.status(204).send();
  }
}
