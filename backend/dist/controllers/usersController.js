"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.updateUserStatus = updateUserStatus;
exports.deleteUser = deleteUser;
const db_1 = require("../config/db");
const password_1 = require("../utils/password");
async function getUsers(req, res) {
    try {
        const { role } = req.query;
        let sql = `
      SELECT 
        u.id, u.name, u.email, u.role, u.phone, u.department, u.status, 
        u.rejected_by, u.rejected_at, u.rejection_reason, u.created_at,
        rb.name as rejected_by_name
      FROM users u
      LEFT JOIN users rb ON u.rejected_by = rb.id
    `;
        const params = [];
        if (role) {
            sql += ' WHERE u.role = $1';
            params.push(role);
        }
        sql += ' ORDER BY u.id DESC';
        const result = await (0, db_1.query)(sql, params);
        return res.json({ users: result.rows });
    }
    catch (error) {
        console.error('getUsers error:', error);
        return res.status(500).json({ message: 'Failed to fetch users.' });
    }
}
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)(`SELECT 
        u.id, u.name, u.email, u.role, u.phone, u.department, u.status, 
        u.rejected_by, u.rejected_at, u.rejection_reason, u.created_at,
        rb.name as rejected_by_name
      FROM users u
      LEFT JOIN users rb ON u.rejected_by = rb.id
      WHERE u.id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.json({ user: result.rows[0] });
    }
    catch (error) {
        console.error('getUserById error:', error);
        return res.status(500).json({ message: 'Failed to fetch user.' });
    }
}
async function createUser(req, res) {
    try {
        const { name, email, password, role, phone, department, status } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, email, password, and role are required.' });
        }
        const existing = await (0, db_1.query)('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const userStatus = status || 'ACTIVE';
        const insertSql = `
      INSERT INTO users (name, email, password_hash, role, phone, department, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, role, phone, department, status, created_at
    `;
        const result = await (0, db_1.query)(insertSql, [
            name,
            email.trim().toLowerCase(),
            hashedPassword,
            role,
            phone || null,
            department || null,
            userStatus,
        ]);
        const newUser = result.rows.length > 0 ? result.rows[0] : { id: result.lastID, name, email, role, phone, department, status: userStatus };
        await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [req.user?.id, 'CREATE_USER', `Created user ${name} (${role})`]);
        return res.status(201).json({ user: newUser });
    }
    catch (error) {
        console.error('createUser error:', error);
        return res.status(500).json({ message: 'Failed to create user.' });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email, password, role, phone, department, status, rejection_reason } = req.body;
        const adminUser = req.user;
        const existing = await (0, db_1.query)('SELECT * FROM users WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        let passwordHash = existing.rows[0].password_hash;
        if (password && password.trim() !== '') {
            passwordHash = await (0, password_1.hashPassword)(password);
        }
        const newStatus = status || existing.rows[0].status;
        if (newStatus === 'REJECTED') {
            if (!rejection_reason && !existing.rows[0].rejection_reason) {
                return res.status(400).json({ message: 'Rejection reason is required.' });
            }
            await (0, db_1.query)(`UPDATE users
         SET name = $1, email = $2, password_hash = $3, role = $4, phone = $5, department = $6, 
             status = $7, rejected_by = $8, rejected_at = CURRENT_TIMESTAMP, rejection_reason = $9, updated_at = CURRENT_TIMESTAMP
         WHERE id = $10`, [
                name || existing.rows[0].name,
                email ? email.trim().toLowerCase() : existing.rows[0].email,
                passwordHash,
                role || existing.rows[0].role,
                phone !== undefined ? phone : existing.rows[0].phone,
                department !== undefined ? department : existing.rows[0].department,
                'REJECTED',
                adminUser.id,
                rejection_reason ? rejection_reason.trim() : existing.rows[0].rejection_reason,
                id,
            ]);
        }
        else {
            await (0, db_1.query)(`UPDATE users
         SET name = $1, email = $2, password_hash = $3, role = $4, phone = $5, department = $6, status = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8`, [
                name || existing.rows[0].name,
                email ? email.trim().toLowerCase() : existing.rows[0].email,
                passwordHash,
                role || existing.rows[0].role,
                phone !== undefined ? phone : existing.rows[0].phone,
                department !== undefined ? department : existing.rows[0].department,
                newStatus,
                id,
            ]);
        }
        return res.json({ message: 'User updated successfully.' });
    }
    catch (error) {
        console.error('updateUser error:', error);
        return res.status(500).json({ message: 'Failed to update user.' });
    }
}
async function updateUserStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;
        const adminUser = req.user;
        if (!['ACTIVE', 'DISABLED', 'REJECTED', 'PENDING', 'INACTIVE', 'ON_LEAVE'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }
        const existing = await (0, db_1.query)('SELECT * FROM users WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (status === 'REJECTED') {
            if (!rejection_reason || rejection_reason.trim() === '') {
                return res.status(400).json({ message: 'Please enter a rejection reason.' });
            }
            await (0, db_1.query)(`UPDATE users
         SET status = $1, rejected_by = $2, rejected_at = CURRENT_TIMESTAMP, rejection_reason = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`, ['REJECTED', adminUser.id, rejection_reason.trim(), id]);
            await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [adminUser.id, 'REJECT_USER', `Admin rejected user ID ${id} (${existing.rows[0].email}) with reason: ${rejection_reason.trim()}`]);
            return res.json({ message: 'Employee registration rejected successfully.' });
        }
        else if (status === 'DISABLED') {
            await (0, db_1.query)(`UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, ['DISABLED', id]);
            await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [adminUser.id, 'DISABLE_USER', `Admin disabled user ID ${id} (${existing.rows[0].email})`]);
            return res.json({ message: 'Employee account disabled successfully.' });
        }
        else if (status === 'ACTIVE') {
            await (0, db_1.query)(`UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, ['ACTIVE', id]);
            await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [adminUser.id, 'ACTIVATE_USER', `Admin activated user ID ${id} (${existing.rows[0].email})`]);
            return res.json({ message: 'Employee account activated successfully.' });
        }
        else {
            await (0, db_1.query)(`UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [status, id]);
            return res.json({ message: `User status updated to ${status}.` });
        }
    }
    catch (error) {
        console.error('updateUserStatus error:', error);
        return res.status(500).json({ message: 'Failed to update user status.' });
    }
}
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        await (0, db_1.query)('DELETE FROM users WHERE id = $1', [id]);
        await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [req.user?.id, 'DELETE_USER', `Deleted user ID ${id}`]);
        return res.json({ message: 'User deleted successfully.' });
    }
    catch (error) {
        console.error('deleteUser error:', error);
        return res.status(500).json({ message: 'Failed to delete user.' });
    }
}
