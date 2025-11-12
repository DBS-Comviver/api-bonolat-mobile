import { CreateUserDTO } from '../dtos/create-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { ConflictError, NotFoundError } from '../../../utils/errors';
import { CryptoUtil } from '../../../utils/crypto';
import { logger } from '../../../config/logger';

export class UserService {
    private userRepository = new UserRepository();

    async createUser(data: CreateUserDTO) {
        logger.debug('User creation request', { username: data.username, email: data.email });

        const existingUserByEmail = await this.userRepository.findByEmail(data.email);
        if (existingUserByEmail) {
            logger.warn('User creation failed: email already exists', { email: data.email });
            throw new ConflictError('User with this email already exists');
        }

        const existingUserByUsername = await this.userRepository.findByUsername(data.username);
        if (existingUserByUsername) {
            logger.warn('User creation failed: username already exists', { username: data.username });
            throw new ConflictError('User with this username already exists');
        }

        const hashedPassword = await CryptoUtil.hashPassword(data.password);

        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword,
        });

        logger.info('User created successfully', { userId: user.id, username: user.username, email: user.email });

        return user;
    }

    async listUsers() {
        return this.userRepository.findAll();
    }

    async getUserById(id: number | string) {
        return this.userRepository.findById(id);
    }

    async updateUser(id: number | string, data: Partial<CreateUserDTO>) {
        const userId = typeof id === 'string' ? parseInt(id, 10) : id;
        logger.debug('User update request', { userId });

        if (data.email) {
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser && existingUser.id !== userId) {
                logger.warn('User update failed: email already exists', { userId, email: data.email });
                throw new ConflictError('User with this email already exists');
            }
        }

        if (data.username) {
            const existingUser = await this.userRepository.findByUsername(data.username);
            if (existingUser && existingUser.id !== userId) {
                logger.warn('User update failed: username already exists', { userId, username: data.username });
                throw new ConflictError('User with this username already exists');
            }
        }

        if (data.password) {
            data.password = await CryptoUtil.hashPassword(data.password);
            logger.debug('User password updated', { userId });
        }

        const user = await this.userRepository.update(id, data);
        logger.info('User updated successfully', { userId });

        return user;
    }

    async deleteUser(id: number | string) {
        const userId = typeof id === 'string' ? parseInt(id, 10) : id;
        logger.info('User deletion request', { userId });
        await this.userRepository.delete(id);
        logger.info('User deleted successfully', { userId });
    }

    async validatePassword(username: string, password: string) {
        const user = await this.userRepository.findByUsername(username);

        if (!user) {
            logger.warn('Password validation failed: user not found', { username });
            throw new NotFoundError('Invalid username or password');
        }

        const isPasswordValid = await CryptoUtil.comparePassword(password, user.password);

        if (!isPasswordValid) {
            logger.warn('Password validation failed: invalid password', { userId: user.id, username });
            throw new NotFoundError('Invalid username or password');
        }

        logger.debug('Password validated successfully', { userId: user.id, username });

        return user;
    }
}
