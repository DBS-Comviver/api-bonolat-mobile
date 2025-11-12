import { prisma } from '../../../config/database';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { NotFoundError } from '../../../utils/errors';

export class UserRepository {
    async create(data: CreateUserDTO) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findById(id: number | string) {
        const userId = typeof id === 'string' ? parseInt(id, 10) : id;
        
        if (isNaN(userId)) {
            throw new NotFoundError('User not found');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string) {
        return prisma.user.findUnique({
            where: { username },
        });
    }

    async update(id: number | string, data: Partial<CreateUserDTO>) {
        const userId = typeof id === 'string' ? parseInt(id, 10) : id;
        
        if (isNaN(userId)) {
            throw new NotFoundError('User not found');
        }

        return prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async delete(id: number | string) {
        const userId = typeof id === 'string' ? parseInt(id, 10) : id;
        
        if (isNaN(userId)) {
            throw new NotFoundError('User not found');
        }

        await prisma.user.delete({
            where: { id: userId },
        });
    }
}
