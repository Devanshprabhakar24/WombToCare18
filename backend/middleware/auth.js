// Auth middleware
import AuthService from '../services/AuthService.js';

// Authenticate token
export const authenticateToken = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: {
                    message: 'Access token is required',
                    code: 'AUTHENTICATION_ERROR',
                    timestamp: new Date().toISOString(),
                },
            });
        }

        // Verify token
        const decoded = await AuthService.verifyToken(token);

        // Attach user data to request
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: {
                message: error.message || 'Invalid or expired token',
                code: 'AUTHENTICATION_ERROR',
                timestamp: new Date().toISOString(),
            },
        });
    }
};

// Authorize role
export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: {
                    message: 'Authentication required',
                    code: 'AUTHENTICATION_ERROR',
                    timestamp: new Date().toISOString(),
                },
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: {
                    message: 'You do not have permission to access this resource',
                    code: 'AUTHORIZATION_ERROR',
                    timestamp: new Date().toISOString(),
                },
            });
        }

        next();
    };
};
