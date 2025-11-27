import crypto from 'crypto';
import { env } from '../../../config/env';

const ENCRYPTION_KEY = env.JWT_SECRET.substring(0, 32).padEnd(32, '0');
const ALGORITHM = 'aes-256-cbc';

interface StoredCredentials {
	login: string;
	encryptedPassword: string;
	iv: string;
}

export class CredentialsRepository {
	private static credentialsCache: Map<string, StoredCredentials> = new Map();

	private encrypt(text: string): { encrypted: string; iv: string } {
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return { encrypted, iv: iv.toString('hex') };
	}

	private decrypt(encrypted: string, iv: string): string {
		const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex'));
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}

	async store(login: string, password: string): Promise<void> {
		const { encrypted, iv } = this.encrypt(password);
		CredentialsRepository.credentialsCache.set(login, {
			login,
			encryptedPassword: encrypted,
			iv,
		});
	}

	async get(login: string): Promise<string | null> {
		const stored = CredentialsRepository.credentialsCache.get(login);
		if (!stored) {
			return null;
		}
		try {
			return this.decrypt(stored.encryptedPassword, stored.iv);
		} catch (error) {
			return null;
		}
	}

	async delete(login: string): Promise<void> {
		CredentialsRepository.credentialsCache.delete(login);
	}

	async clear(): Promise<void> {
		CredentialsRepository.credentialsCache.clear();
	}
}

