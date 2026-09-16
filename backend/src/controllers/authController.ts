import { Request, Response } from 'express';
import { query } from '../config/db';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await hashPassword(password);

    // SECURITY MANDATE: Public registration ALWAYS assigns role = 'EMPLOYEE' and status = 'PENDING'
    const insertSql = `
      INSERT INTO users (name, email, password_hash, role, phone, department, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, role, phone, department, status, created_at
    `;

    const result = await query(insertSql, [
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
    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [newUserId, 'EMPLOYEE_REGISTERED', `New field officer ${name} (${email}) registered. Pending admin approval.`]
    );

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
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Failed to process registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const userResult = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (userResult.rows.length === 0) {
      await query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [null, 'LOGIN_FAILED', `Failed login attempt for unknown email: ${email}`]
      );
      return res.status(401).json({ message: 'Invalid credentials. Account not found.' });
    }

    const user = userResult.rows[0];

    // Password verification (checks exact and trimmed password for copy-paste safety)
    const isValid = (await comparePassword(password, user.password_hash)) || (await comparePassword(password.trim(), user.password_hash));
    if (!isValid) {
      await query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [user.id, 'LOGIN_FAILED', `Failed login attempt (invalid password) for user: ${email}`]
      );
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
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

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [user.id, 'LOGIN_SUCCESS', `User ${user.name} (${user.role}) logged in.`]
    );

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
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user) {
      await query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [req.user.id, 'LOGOUT', `User ${req.user.email} logged out.`]
      );
    }
    return res.json({ message: 'Logged out successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Logout failed.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const result = await query(
      'SELECT id, name, email, role, phone, department, status, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error: any) {
    console.error('GetMe error:', error);
    return res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
}
