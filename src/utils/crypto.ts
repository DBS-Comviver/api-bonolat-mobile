import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env';

export class CryptoUtil {
    static async hashPassword(password: string): Promise<string> {
        const rounds = parseInt(env.BCRYPT_ROUNDS);
        return bcrypt.hash(password, rounds);
    }

    static async comparePassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    static generateRandomString(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    static generateToken(length: number = 64): string {
        return crypto.randomBytes(length).toString('hex');
    }

    static hashSHA256(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    static hashMD5(data: string): string {
        return crypto.createHash('md5').update(data).digest('hex');
    }

    static generateUUID(): string {
        return crypto.randomUUID();
    }

    static encryptAES(text: string, key: string): string {
        const algorithm = 'aes-256-cbc';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            algorithm,
            Buffer.from(key.slice(0, 32), 'hex'),
            iv
        );

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return iv.toString('hex') + ':' + encrypted;
    }

    static decryptAES(encryptedText: string, key: string): string {
        const algorithm = 'aes-256-cbc';
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0] || '', 'hex');
        const encrypted = parts[1] || '';

        const decipher = crypto.createDecipheriv(
            algorithm,
            Buffer.from(key.slice(0, 32), 'hex'),
            iv
        );

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

