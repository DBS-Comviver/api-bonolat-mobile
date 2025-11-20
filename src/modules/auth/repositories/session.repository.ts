export class SessionRepository {
	async create(data: {
		login: string;
		token: string;
		expiresAt: Date;
	}) {
		return {
			id: 0,
			login: data.login,
			token: data.token,
			expiresAt: data.expiresAt,
			createdAt: new Date(),
		};
	}

	async findByToken(token: string) {
		// Stateless: Token validation is done via JWT verification
		// Return null to indicate no database lookup needed
		return null;
	}

	async findByLogin(login: string) {
		// Stateless: No database storage
		return [];
	}

	async delete(token: string) {
		// Stateless: Token invalidation is handled by JWT expiration
		// No database cleanup needed
	}

	async deleteAllUserSessions(login: string) {
		// Stateless: No database cleanup needed
	}

	async deleteExpiredSessions() {
		// Stateless: JWT tokens expire automatically, no cleanup needed
	}
}

