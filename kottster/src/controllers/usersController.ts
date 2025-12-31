import { Request, Response } from 'express';
import { query } from '../config/database';

export const usersController = {
  async list(req: Request, res: Response) {
    try {
      const { search, role, is_active, _page = '1', _perPage = '25', _sort = 'created_at', _order = 'DESC' } = req.query;

      const page = parseInt(_page as string);
      const perPage = parseInt(_perPage as string);
      const offset = (page - 1) * perPage;

      const whereClauses: string[] = [];
      const params: any[] = [];

      if (search) {
        whereClauses.push(`(email ILIKE $${params.length + 1} OR first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      if (role) {
        whereClauses.push(`role = $${params.length + 1}`);
        params.push(role);
      }

      if (is_active !== undefined) {
        whereClauses.push(`is_active = $${params.length + 1}`);
        params.push(is_active === 'true');
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countResult = await query(
        `SELECT COUNT(*) as total FROM users ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      const dataResult = await query(
        `SELECT id, email, first_name, last_name,
                first_name || ' ' || last_name as full_name,
                phone, role, timezone, avatar, is_active, is_staff,
                email_verified, created_at, updated_at, last_login
         FROM users ${whereClause}
         ORDER BY ${_sort} ${_order}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, perPage, offset]
      );

      res.json({
        data: dataResult.rows,
        total: total
      });
    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT id, email, first_name, last_name,
                first_name || ' ' || last_name as full_name,
                phone, role, timezone, avatar, is_active, is_staff,
                email_verified, preferences, bio, created_at, updated_at, last_login
         FROM users WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const {
        email,
        first_name,
        last_name,
        phone = '',
        role = 'student',
        timezone = 'UTC',
        is_active = true,
        is_staff = false
      } = req.body;

      if (!email || !first_name || !last_name) {
        return res.status(400).json({ error: 'Email, first name, and last name are required' });
      }

      // Check if email already exists
      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const result = await query(
        `INSERT INTO users (email, first_name, last_name, phone, role, timezone, is_active, is_staff)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, first_name, last_name, phone, role, timezone, is_active, is_staff, created_at`,
        [email, first_name, last_name, phone, role, timezone, is_active, is_staff]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, first_name, last_name, phone, role, timezone, is_active, is_staff, email_verified, bio } = req.body;

      const setClauses: string[] = [];
      const params: any[] = [];

      if (email !== undefined) {
        setClauses.push(`email = $${params.length + 1}`);
        params.push(email);
      }
      if (first_name !== undefined) {
        setClauses.push(`first_name = $${params.length + 1}`);
        params.push(first_name);
      }
      if (last_name !== undefined) {
        setClauses.push(`last_name = $${params.length + 1}`);
        params.push(last_name);
      }
      if (phone !== undefined) {
        setClauses.push(`phone = $${params.length + 1}`);
        params.push(phone);
      }
      if (role !== undefined) {
        setClauses.push(`role = $${params.length + 1}`);
        params.push(role);
      }
      if (timezone !== undefined) {
        setClauses.push(`timezone = $${params.length + 1}`);
        params.push(timezone);
      }
      if (is_active !== undefined) {
        setClauses.push(`is_active = $${params.length + 1}`);
        params.push(is_active);
      }
      if (is_staff !== undefined) {
        setClauses.push(`is_staff = $${params.length + 1}`);
        params.push(is_staff);
      }
      if (email_verified !== undefined) {
        setClauses.push(`email_verified = $${params.length + 1}`);
        params.push(email_verified);
      }
      if (bio !== undefined) {
        setClauses.push(`bio = $${params.length + 1}`);
        params.push(bio);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      if (setClauses.length === 1) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const result = await query(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Soft delete - just set is_active to false
      const result = await query(
        'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};
