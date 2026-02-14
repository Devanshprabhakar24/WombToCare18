import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - User ID and JWT token
     */
    async register(userData) {
        const { name, email, phone, password, role = 'donor' } = userData;

        // Check if user already exists
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

        // Generate JWT token
        const token = this.generateToken(user._id, user.role);

        return {
            userId: user._id.toString(),
            token,
            role: user.role,
            name: user.name,
            email: user.email,
        };
    }

    /**
     * Login user
     * @param {Object} credentials - Email and password
     * @returns {Promise<Object>} - User ID, token, and role
     */
    async login(credentials) {
        const { email, password } = credentials;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Compare password
        const isPasswordValid = await this.comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = this.generateToken(user._id, user.role);

        return {
            userId: user._id.toString(),
            token,
            role: user.role,
            name: user.name,
            email: user.email,
        };
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Promise<Object>} - User ID and role
     */
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

    /**
     * Hash password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} - Hashed password
     */
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Compare password with hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} - True if password matches
     */
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Generate JWT token
     * @param {string} userId - User ID
     * @param {string} role - User role
     * @returns {string} - JWT token
     */
    generateToken(userId, role) {
        return jwt.sign(
            { userId: userId.toString(), role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - User object
     */
    async getUserById(userId) {
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

export default new AuthService();
