import { Request, Response } from 'express';
import { query } from '../config/database';

export const teachersController = {
  async list(req: Request, res: Response) {
    try {
      const { search, studio_id, is_active, _page = '1', _perPage = '25', _sort = 'created_at', _order = 'DESC' } = req.query;

      const page = parseInt(_page as string);
      const perPage = parseInt(_perPage as string);
      const offset = (page - 1) * perPage;

      const whereClauses: string[] = [];
      const params: any[] = [];

      if (search) {
        whereClauses.push(`(u.email ILIKE $${params.length + 1} OR u.first_name ILIKE $${params.length + 1} OR u.last_name ILIKE $${params.length + 1} OR t.bio ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      if (studio_id) {
        whereClauses.push(`t.studio_id = $${params.length + 1}`);
        params.push(studio_id);
      }

      if (is_active !== undefined) {
        whereClauses.push(`t.is_active = $${params.length + 1}`);
        params.push(is_active === 'true');
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countResult = await query(
        `SELECT COUNT(*) as total FROM teachers t ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      const dataResult = await query(
        `SELECT t.id, t.user_id, t.studio_id,
                u.email, u.first_name || ' ' || u.last_name as full_name,
                u.phone, u.avatar,
                s.name as studio_name,
                t.bio, t.specialties, t.instruments, t.hourly_rate,
                t.availability, t.auto_accept_bookings, t.is_active,
                t.created_at, t.updated_at,
                (SELECT COUNT(*) FROM students st WHERE st.teacher_id = t.id) as students_count
         FROM teachers t
         LEFT JOIN users u ON t.user_id = u.id
         LEFT JOIN studios s ON t.studio_id = s.id
         ${whereClause}
         ORDER BY ${_sort} ${_order}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, perPage, offset]
      );

      res.json({
        data: dataResult.rows,
        total: total
      });
    } catch (error) {
      console.error('Error listing teachers:', error);
      res.status(500).json({ error: 'Failed to fetch teachers' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT t.id, t.user_id, t.studio_id,
                u.email, u.first_name || ' ' || u.last_name as full_name,
                u.phone, u.avatar, u.timezone,
                s.name as studio_name,
                t.bio, t.specialties, t.instruments, t.hourly_rate,
                t.availability, t.auto_accept_bookings, t.is_active,
                t.created_at, t.updated_at
         FROM teachers t
         LEFT JOIN users u ON t.user_id = u.id
         LEFT JOIN studios s ON t.studio_id = s.id
         WHERE t.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching teacher:', error);
      res.status(500).json({ error: 'Failed to fetch teacher' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const {
        user_id,
        studio_id,
        bio = '',
        specialties = [],
        instruments = [],
        hourly_rate = 0,
        availability = {},
        auto_accept_bookings = false,
        is_active = true
      } = req.body;

      if (!user_id || !studio_id) {
        return res.status(400).json({ error: 'User ID and Studio ID are required' });
      }

      // Check if user exists and has teacher role
      const userCheck = await query(
        'SELECT id, role FROM users WHERE id = $1',
        [user_id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (userCheck.rows[0].role !== 'teacher') {
        return res.status(400).json({ error: 'User must have teacher role' });
      }

      // Check if teacher already exists for this user
      const existing = await query(
        'SELECT id FROM teachers WHERE user_id = $1',
        [user_id]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Teacher profile already exists for this user' });
      }

      const result = await query(
        `INSERT INTO teachers (user_id, studio_id, bio, specialties, instruments, hourly_rate, availability, auto_accept_bookings, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [user_id, studio_id, bio, specialties, instruments, hourly_rate, availability, auto_accept_bookings, is_active]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating teacher:', error);
      res.status(500).json({ error: 'Failed to create teacher' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user_id, studio_id, bio, specialties, instruments, hourly_rate, availability, auto_accept_bookings, is_active } = req.body;

      const setClauses: string[] = [];
      const params: any[] = [];

      if (user_id !== undefined) {
        setClauses.push(`user_id = $${params.length + 1}`);
        params.push(user_id);
      }
      if (studio_id !== undefined) {
        setClauses.push(`studio_id = $${params.length + 1}`);
        params.push(studio_id);
      }
      if (bio !== undefined) {
        setClauses.push(`bio = $${params.length + 1}`);
        params.push(bio);
      }
      if (specialties !== undefined) {
        setClauses.push(`specialties = $${params.length + 1}`);
        params.push(specialties);
      }
      if (instruments !== undefined) {
        setClauses.push(`instruments = $${params.length + 1}`);
        params.push(instruments);
      }
      if (hourly_rate !== undefined) {
        setClauses.push(`hourly_rate = $${params.length + 1}`);
        params.push(hourly_rate);
      }
      if (availability !== undefined) {
        setClauses.push(`availability = $${params.length + 1}`);
        params.push(availability);
      }
      if (auto_accept_bookings !== undefined) {
        setClauses.push(`auto_accept_bookings = $${params.length + 1}`);
        params.push(auto_accept_bookings);
      }
      if (is_active !== undefined) {
        setClauses.push(`is_active = $${params.length + 1}`);
        params.push(is_active);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      if (setClauses.length === 1) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const result = await query(
        `UPDATE teachers SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating teacher:', error);
      res.status(500).json({ error: 'Failed to update teacher' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM teachers WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      res.status(500).json({ error: 'Failed to delete teacher' });
    }
  }
};
