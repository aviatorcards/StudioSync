import { Request, Response } from 'express';
import { query } from '../config/database';

export const studentsController = {
  async list(req: Request, res: Response) {
    try {
      const { search, studio_id, teacher_id, is_active, _page = '1', _perPage = '25', _sort = 'created_at', _order = 'DESC' } = req.query;

      const page = parseInt(_page as string);
      const perPage = parseInt(_perPage as string);
      const offset = (page - 1) * perPage;

      const whereClauses: string[] = [];
      const params: any[] = [];

      if (search) {
        whereClauses.push(`(u.email ILIKE $${params.length + 1} OR u.first_name ILIKE $${params.length + 1} OR u.last_name ILIKE $${params.length + 1} OR st.instrument ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      if (studio_id) {
        whereClauses.push(`st.studio_id = $${params.length + 1}`);
        params.push(studio_id);
      }

      if (teacher_id) {
        whereClauses.push(`st.teacher_id = $${params.length + 1}`);
        params.push(teacher_id);
      }

      if (is_active !== undefined) {
        whereClauses.push(`st.is_active = $${params.length + 1}`);
        params.push(is_active === 'true');
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countResult = await query(
        `SELECT COUNT(*) as total FROM students st ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      const dataResult = await query(
        `SELECT st.id, st.user_id, st.studio_id, st.teacher_id, st.family_id,
                u.email, u.first_name || ' ' || u.last_name as full_name,
                u.phone, u.avatar,
                s.name as studio_name,
                t.user_id as teacher_user_id,
                tu.first_name || ' ' || tu.last_name as teacher_name,
                st.instrument, st.skill_level, st.goals,
                st.enrollment_date, st.birth_date,
                st.emergency_contact, st.is_active,
                st.created_at, st.updated_at
         FROM students st
         LEFT JOIN users u ON st.user_id = u.id
         LEFT JOIN studios s ON st.studio_id = s.id
         LEFT JOIN teachers t ON st.teacher_id = t.id
         LEFT JOIN users tu ON t.user_id = tu.id
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
      console.error('Error listing students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT st.id, st.user_id, st.studio_id, st.teacher_id, st.family_id,
                u.email, u.first_name || ' ' || u.last_name as full_name,
                u.phone, u.avatar, u.timezone,
                s.name as studio_name,
                t.user_id as teacher_user_id,
                tu.first_name || ' ' || tu.last_name as teacher_name,
                st.instrument, st.skill_level, st.goals,
                st.enrollment_date, st.birth_date,
                st.medical_notes, st.emergency_contact, st.is_active,
                st.created_at, st.updated_at
         FROM students st
         LEFT JOIN users u ON st.user_id = u.id
         LEFT JOIN studios s ON st.studio_id = s.id
         LEFT JOIN teachers t ON st.teacher_id = t.id
         LEFT JOIN users tu ON t.user_id = tu.id
         WHERE st.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: 'Failed to fetch student' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const {
        user_id,
        studio_id,
        teacher_id = null,
        family_id = null,
        instrument = '',
        skill_level = 'beginner',
        goals = '',
        enrollment_date = new Date(),
        birth_date = null,
        medical_notes = '',
        emergency_contact = {},
        is_active = true
      } = req.body;

      if (!user_id || !studio_id) {
        return res.status(400).json({ error: 'User ID and Studio ID are required' });
      }

      // Check if user exists and has student role
      const userCheck = await query(
        'SELECT id, role FROM users WHERE id = $1',
        [user_id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (userCheck.rows[0].role !== 'student') {
        return res.status(400).json({ error: 'User must have student role' });
      }

      // Check if student already exists for this user
      const existing = await query(
        'SELECT id FROM students WHERE user_id = $1',
        [user_id]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Student profile already exists for this user' });
      }

      const result = await query(
        `INSERT INTO students (user_id, studio_id, teacher_id, family_id, instrument, skill_level, goals, enrollment_date, birth_date, medical_notes, emergency_contact, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [user_id, studio_id, teacher_id, family_id, instrument, skill_level, goals, enrollment_date, birth_date, medical_notes, emergency_contact, is_active]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating student:', error);
      res.status(500).json({ error: 'Failed to create student' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user_id, studio_id, teacher_id, family_id, instrument, skill_level, goals, enrollment_date, birth_date, medical_notes, emergency_contact, is_active } = req.body;

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
      if (teacher_id !== undefined) {
        setClauses.push(`teacher_id = $${params.length + 1}`);
        params.push(teacher_id);
      }
      if (family_id !== undefined) {
        setClauses.push(`family_id = $${params.length + 1}`);
        params.push(family_id);
      }
      if (instrument !== undefined) {
        setClauses.push(`instrument = $${params.length + 1}`);
        params.push(instrument);
      }
      if (skill_level !== undefined) {
        setClauses.push(`skill_level = $${params.length + 1}`);
        params.push(skill_level);
      }
      if (goals !== undefined) {
        setClauses.push(`goals = $${params.length + 1}`);
        params.push(goals);
      }
      if (enrollment_date !== undefined) {
        setClauses.push(`enrollment_date = $${params.length + 1}`);
        params.push(enrollment_date);
      }
      if (birth_date !== undefined) {
        setClauses.push(`birth_date = $${params.length + 1}`);
        params.push(birth_date);
      }
      if (medical_notes !== undefined) {
        setClauses.push(`medical_notes = $${params.length + 1}`);
        params.push(medical_notes);
      }
      if (emergency_contact !== undefined) {
        setClauses.push(`emergency_contact = $${params.length + 1}`);
        params.push(emergency_contact);
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
        `UPDATE students SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM students WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Failed to delete student' });
    }
  }
};
