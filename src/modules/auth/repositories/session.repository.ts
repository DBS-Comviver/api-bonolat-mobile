import { prisma } from '../../../config/database';

export class SessionRepository {
	async create(data: {
		userId: number;
		token: string;
		expiresAt: Date;
	}) {
		return prisma.session.create({
			data,
		});
	}

	async findByToken(token: string) {
		return prisma.session.findUnique({
			where: { token },
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
			},
		});
	}

	async findByUserId(userId: number) {
		return prisma.session.findMany({
			where: {
				userId,
				expiresAt: {
					gt: new Date(),
				},
			},
		});
	}

	async delete(token: string) {
		await prisma.session.delete({
			where: { token },
		});
	}

	async deleteAllUserSessions(userId: number) {
		await prisma.session.deleteMany({
			where: { userId },
		});
	}

	async deleteExpiredSessions() {
		await prisma.session.deleteMany({
			where: {
				expiresAt: {
					lt: new Date(),
				},
			},
		});
	}
}

