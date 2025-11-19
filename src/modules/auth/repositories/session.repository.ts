import { prisma } from '../../../config/database';

export class SessionRepository {
	async create(data: {
		login: string;
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
		});
	}

	async findByLogin(login: string) {
		return prisma.session.findMany({
			where: {
				login,
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

	async deleteAllUserSessions(login: string) {
		await prisma.session.deleteMany({
			where: { login },
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

