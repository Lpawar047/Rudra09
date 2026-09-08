"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireRole = requireRole;
const jwt_1 = require("../utils/jwt");
const db_1 = require("../config/db");
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }
    const payload = (0, jwt_1.verifyToken)(token);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    try {
        // Database source of truth check for user's account status and role
        const userRes = await (0, db_1.query)('SELECT id, email, role, status FROM users WHERE id = $1', [payload.id]);
        if (userRes.rows.length === 0) {
            return res.status(401).json({ message: 'User account no longer exists.' });
        }
        const dbUser = userRes.rows[0];
        if (dbUser.status === 'REJECTED') {
            return res.status(403).json({ message: 'Your account registration was rejected by Admin.' });
        }
        if (dbUser.status === 'DISABLED') {
            return res.status(403).json({ message: 'Your account has been disabled. Please contact Admin.' });
        }
        if (dbUser.status === 'PENDING') {
            return res.status(403).json({ message: 'Your account registration is pending approval.' });
        }
        if (dbUser.status !== 'ACTIVE') {
            return res.status(403).json({ message: 'Your account is not active. Please contact Admin.' });
        }
        req.user = {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
            status: dbUser.status,
        };
        next();
    }
    catch (error) {
        console.error('authenticateToken verification error:', error);
        return res.status(500).json({ message: 'Internal server error verifying token.' });
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permission.' });
        }
        next();
    };
}
