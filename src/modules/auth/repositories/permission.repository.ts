import { prisma } from '../../../config/database';
import { NotFoundError } from '../../../utils/errors';

export class PermissionRepository {
	private buildLoginCandidates(login: string): string[] {
		const trimmed = login.trim();
		if (!trimmed) return [];

		const candidates = new Set<string>();
		const add = (value: string) => {
			const v = value.trim();
			if (v) candidates.add(v);
		};

		const atIndex = trimmed.indexOf('@');
		if (atIndex === -1) {
			// Try as-is and with Asperbras domain appended.
			add(trimmed);
			add(`${trimmed}@asperbras`);
			return [...candidates];
		}

		const user = trimmed.slice(0, atIndex);
		const domain = trimmed.slice(atIndex + 1).toLowerCase();

		// Try as-is and, only for Asperbras logins, also try without domain.
		add(trimmed);
		if (domain.startsWith('asperbras')) {
			add(user);
			add(`${user}@asperbras`);
		}

		return [...candidates];
	}

	async findByLogin(login: string) {
		const candidates = this.buildLoginCandidates(login);
		if (candidates.length === 0) {
			throw new NotFoundError('User permissions not found');
		}

		const permissions = await prisma.usuarioAcessos.findFirst({
			where: { OR: candidates.map((candidate) => ({ login: candidate })) },
		});

		if (!permissions) {
			throw new NotFoundError('User permissions not found');
		}

		return permissions;
	}

	async hasFractioningAccess(login: string): Promise<boolean> {
		const candidates = this.buildLoginCandidates(login);
		if (candidates.length === 0) return false;

		const permissions = await prisma.usuarioAcessos.findFirst({
			where: { OR: candidates.map((candidate) => ({ login: candidate })) },
		});

		if (!permissions) {
			return false;
		}

		const hasEstoque = permissions.estoque === 1;
		const hasAdministrador = permissions.administrador === 1;

		return hasEstoque || hasAdministrador;
	}
}

