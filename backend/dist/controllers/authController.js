"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getMe = getMe;
const db_1 = require("../config/db");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
async function register(req, res) {
    try {
        const { name, email, password, phone, department } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Full name, email, and password are required.' });
        }
        const existing = await (0, db_1.query)('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'An account with this email address already exists.' });
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        // SECURITY MANDATE: Public registration ALWAYS assigns role = 'EMPLOYEE' and status = 'PENDING'
        const insertSql = `
      INSERT INTO users (name, email, password_hash, role, phone, department, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, role, phone, department, status, created_at
    `;
        const result = await (0, db_1.query)(insertSql, [
            name.trim(),
            email.trim().toLowerCase(),
            hashedPassword,
            'EMPLOYEE',
            phone || null,
            department || 'Field Recovery',
            'PENDING',
        ]);
        const newUserId = result.rows.length > 0 ? result.rows[0].id : result.lastID;
        // Log registration audit trail
        await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [newUserId, 'EMPLOYEE_REGISTERED', `New field officer ${name} (${email}) registered. Pending admin approval.`]);
        return res.status(201).json({
            message: 'Registration submitted successfully. Your account is pending Admin approval.',
            user: {
                id: newUserId,
                name,
                email: email.trim().toLowerCase(),
                role: 'EMPLOYEE',
                status: 'PENDING',
            },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Failed to process registration.' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const userResult = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
        if (userResult.rows.length === 0) {
            await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [null, 'LOGIN_FAILED', `Failed login attempt for unknown email: ${email}`]);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const user = userResult.rows[0];
        // Password verification FIRST
        const isValid = await (0, password_1.comparePassword)(password, user.password_hash);
        if (!isValid) {
            await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [user.id, 'LOGIN_FAILED', `Failed login attempt (invalid password) for user: ${email}`]);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Account status verification SECOND
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
        const token = (0, jwt_1.signToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        // Log activity
        await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [user.id, 'LOGIN_SUCCESS', `User ${user.name} (${user.role}) logged in.`]);
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
async function logout(req, res) {
    try {
        if (req.user) {
            await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [req.user.id, 'LOGOUT', `User ${req.user.email} logged out.`]);
        }
        return res.json({ message: 'Logged out successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Logout failed.' });
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
