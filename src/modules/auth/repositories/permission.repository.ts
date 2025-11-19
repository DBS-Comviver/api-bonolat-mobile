import { prisma } from '../../../config/database';
import { NotFoundError } from '../../../utils/errors';

export class PermissionRepository {
	async findByLogin(login: string) {
		const permissions = await prisma.usuarioAcessos.findUnique({
			where: { login },
		});

		if (!permissions) {
			throw new NotFoundError('User permissions not found');
		}

		return permissions;
	}

	async hasFractioningAccess(login: string): Promise<boolean> {
		const permissions = await prisma.usuarioAcessos.findUnique({
			where: { login },
		});

		if (!permissions) {
			return false;
		}

		const hasEstoque = permissions.estoque === 1;
		const hasAdministrador = permissions.administrador === 1;

		return hasEstoque || hasAdministrador;
	}
}

