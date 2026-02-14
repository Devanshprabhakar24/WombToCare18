// Auth service
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthService {
    // Register user
    async register(userData) {
        const { name, email, phone, password, role = 'donor' } = userData;

        // Check exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            passwordHash,
            role,
        });

        // JWT token
        const token = this.generateToken(user._id, user.role);

        return {
            userId: user._id.toString(),
            token,
            role: user.role,
            name: user.name,
            email: user.email,
        };
    }

    // Login user
    async login(credentials) {
        const { email, password } = credentials;

        // Find by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check password
        const isPasswordValid = await this.comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // JWT token
        const token = this.generateToken(user._id, user.role);

        return {
            userId: user._id.toString(),
            token,
            role: user.role,
            name: user.name,
            email: user.email,
        };
    }

    // Verify token
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return {
                userId: decoded.userId,
                role: decoded.role,
            };
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    // Hash password
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    // Compare password
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    // Generate token
    generateToken(userId, role) {
        return jwt.sign(
            { userId: userId.toString(), role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    // Get user by ID
    async getUserById(userId) {
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

export default new AuthService();
