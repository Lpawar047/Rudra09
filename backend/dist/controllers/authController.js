"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getMe = getMe;
const db_1 = require("../config/db");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const userResult = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const user = userResult.rows[0];
        if (user.status === 'REJECTED') {
            return res.status(403).json({ message: 'Your account registration was rejected by Admin.' });
        }
        if (user.status === 'DISABLED') {
            return res.status(403).json({ message: 'Your account has been disabled. Please contact Admin.' });
        }
        if (user.status === 'PENDING') {
            return res.status(403).json({ message: 'Your account registration is pending approval.' });
        }
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ message: 'Your account is not active. Please contact Admin.' });
        }
        const isValid = await (0, password_1.comparePassword)(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = (0, jwt_1.signToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        // Log activity
        await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [user.id, 'USER_LOGIN', `User ${user.name} (${user.role}) logged in.`]);
        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
}
async function getMe(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated.' });
        }
        const result = await (0, db_1.query)('SELECT id, name, email, role, phone, department, status, created_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.json({ user: result.rows[0] });
    }
    catch (error) {
        console.error('GetMe error:', error);
        return res.status(500).json({ message: 'Failed to retrieve profile.' });
    }
}
