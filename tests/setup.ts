import { PrismaClient } from '../src/generated/prisma-client/client';

const prisma = new PrismaClient();

beforeAll(async () => {
	await prisma.user.deleteMany();
});

afterAll(async () => {
	await prisma.user.deleteMany();
	await prisma.$disconnect();
});

