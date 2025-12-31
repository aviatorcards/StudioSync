import { Request, Response } from 'express';
import { query } from '../config/database';

export const lessonsController = {
  async list(req: Request, res: Response) {
    try {
      const {
        search,
        teacher_id,
        student_id,
        room_id,
        status,
        date_from,
        date_to,
        _page = '1',
        _perPage = '25',
        _sort = 'scheduled_start',
        _order = 'DESC'
      } = req.query;

      const page = parseInt(_page as string);
      const perPage = parseInt(_perPage as string);
      const offset = (page - 1) * perPage;

      const whereClauses: string[] = [];
      const params: any[] = [];

      if (search) {
        whereClauses.push(`(l.notes ILIKE $${params.length + 1} OR l.lesson_type ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      if (teacher_id) {
        whereClauses.push(`l.teacher_id = $${params.length + 1}`);
        params.push(teacher_id);
      }

      if (student_id) {
        whereClauses.push(`l.student_id = $${params.length + 1}`);
        params.push(student_id);
      }

      if (room_id) {
        whereClauses.push(`l.room_id = $${params.length + 1}`);
        params.push(room_id);
      }

      if (status) {
        whereClauses.push(`l.status = $${params.length + 1}`);
        params.push(status);
      }

      if (date_from) {
        whereClauses.push(`l.scheduled_start >= $${params.length + 1}`);
        params.push(date_from);
      }

      if (date_to) {
        whereClauses.push(`l.scheduled_start <= $${params.length + 1}`);
        params.push(date_to);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countResult = await query(
        `SELECT COUNT(*) as total FROM lessons l ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      const dataResult = await query(
        `SELECT l.id, l.teacher_id, l.student_id, l.room_id,
                l.scheduled_start, l.scheduled_end, l.duration,
                l.lesson_type, l.status, l.rate, l.notes,
                l.is_recurring, l.recurrence_type, l.recurrence_end_date,
                tu.first_name || ' ' || tu.last_name as teacher_name,
                su.first_name || ' ' || su.last_name as student_name,
                r.name as room_name,
                l.created_at, l.updated_at
         FROM lessons l
         LEFT JOIN teachers t ON l.teacher_id = t.id
         LEFT JOIN users tu ON t.user_id = tu.id
         LEFT JOIN students s ON l.student_id = s.id
         LEFT JOIN users su ON s.user_id = su.id
         LEFT JOIN practice_rooms r ON l.room_id = r.id
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
      console.error('Error listing lessons:', error);
      res.status(500).json({ error: 'Failed to fetch lessons' });
    }
  },

  async calendar(req: Request, res: Response) {
    try {
      const { teacher_id, student_id, room_id, start, end } = req.query;

      const whereClauses: string[] = [];
      const params: any[] = [];

      if (teacher_id) {
        whereClauses.push(`l.teacher_id = $${params.length + 1}`);
        params.push(teacher_id);
      }

      if (student_id) {
        whereClauses.push(`l.student_id = $${params.length + 1}`);
        params.push(student_id);
      }

      if (room_id) {
        whereClauses.push(`l.room_id = $${params.length + 1}`);
        params.push(room_id);
      }

      if (start) {
        whereClauses.push(`l.scheduled_start >= $${params.length + 1}`);
        params.push(start);
      }

      if (end) {
        whereClauses.push(`l.scheduled_start <= $${params.length + 1}`);
        params.push(end);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const result = await query(
        `SELECT l.id, l.teacher_id, l.student_id, l.room_id,
                l.scheduled_start as start,
                l.scheduled_end as end,
                l.duration, l.lesson_type, l.status,
                tu.first_name || ' ' || tu.last_name as teacher_name,
                su.first_name || ' ' || su.last_name as student_name,
                r.name as room_name,
                CONCAT(su.first_name, ' ', su.last_name, ' - ', l.lesson_type) as title
         FROM lessons l
         LEFT JOIN teachers t ON l.teacher_id = t.id
         LEFT JOIN users tu ON t.user_id = tu.id
         LEFT JOIN students s ON l.student_id = s.id
         LEFT JOIN users su ON s.user_id = su.id
         LEFT JOIN practice_rooms r ON l.room_id = r.id
         ${whereClause}
         ORDER BY l.scheduled_start ASC`,
        params
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching calendar lessons:', error);
      res.status(500).json({ error: 'Failed to fetch calendar lessons' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT l.id, l.teacher_id, l.student_id, l.room_id,
                l.scheduled_start, l.scheduled_end, l.duration,
                l.lesson_type, l.status, l.rate, l.notes,
                l.is_recurring, l.recurrence_type, l.recurrence_end_date,
                tu.first_name || ' ' || tu.last_name as teacher_name,
                su.first_name || ' ' || su.last_name as student_name,
                r.name as room_name,
                l.created_at, l.updated_at
         FROM lessons l
         LEFT JOIN teachers t ON l.teacher_id = t.id
         LEFT JOIN users tu ON t.user_id = tu.id
         LEFT JOIN students s ON l.student_id = s.id
         LEFT JOIN users su ON s.user_id = su.id
         LEFT JOIN practice_rooms r ON l.room_id = r.id
         WHERE l.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      res.status(500).json({ error: 'Failed to fetch lesson' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const {
        teacher_id,
        student_id,
        room_id = null,
        scheduled_start,
        scheduled_end,
        duration,
        lesson_type = 'regular',
        status = 'scheduled',
        rate = 0,
        notes = '',
        is_recurring = false,
        recurrence_type = null,
        recurrence_end_date = null
      } = req.body;

      if (!teacher_id || !student_id || !scheduled_start || !scheduled_end) {
        return res.status(400).json({ error: 'Teacher ID, Student ID, scheduled start, and scheduled end are required' });
      }

      // Check for scheduling conflicts
      const conflictCheck = await query(
        `SELECT id FROM lessons
         WHERE teacher_id = $1
         AND status != 'cancelled'
         AND (
           (scheduled_start <= $2 AND scheduled_end > $2)
           OR (scheduled_start < $3 AND scheduled_end >= $3)
           OR (scheduled_start >= $2 AND scheduled_end <= $3)
         )`,
        [teacher_id, scheduled_start, scheduled_end]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Teacher has a scheduling conflict at this time' });
      }

      // Check room conflicts if room is specified
      if (room_id) {
        const roomConflictCheck = await query(
          `SELECT id FROM lessons
           WHERE room_id = $1
           AND status != 'cancelled'
           AND (
             (scheduled_start <= $2 AND scheduled_end > $2)
             OR (scheduled_start < $3 AND scheduled_end >= $3)
             OR (scheduled_start >= $2 AND scheduled_end <= $3)
           )`,
          [room_id, scheduled_start, scheduled_end]
        );

        if (roomConflictCheck.rows.length > 0) {
          return res.status(409).json({ error: 'Room is already booked at this time' });
        }
      }

      const result = await query(
        `INSERT INTO lessons (teacher_id, student_id, room_id, scheduled_start, scheduled_end, duration, lesson_type, status, rate, notes, is_recurring, recurrence_type, recurrence_end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [teacher_id, student_id, room_id, scheduled_start, scheduled_end, duration, lesson_type, status, rate, notes, is_recurring, recurrence_type, recurrence_end_date]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(500).json({ error: 'Failed to create lesson' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        teacher_id,
        student_id,
        room_id,
        scheduled_start,
        scheduled_end,
        duration,
        lesson_type,
        status,
        rate,
        notes,
        is_recurring,
        recurrence_type,
        recurrence_end_date
      } = req.body;

      const setClauses: string[] = [];
      const params: any[] = [];

      if (teacher_id !== undefined) {
        setClauses.push(`teacher_id = $${params.length + 1}`);
        params.push(teacher_id);
      }
      if (student_id !== undefined) {
        setClauses.push(`student_id = $${params.length + 1}`);
        params.push(student_id);
      }
      if (room_id !== undefined) {
        setClauses.push(`room_id = $${params.length + 1}`);
        params.push(room_id);
      }
      if (scheduled_start !== undefined) {
        setClauses.push(`scheduled_start = $${params.length + 1}`);
        params.push(scheduled_start);
      }
      if (scheduled_end !== undefined) {
        setClauses.push(`scheduled_end = $${params.length + 1}`);
        params.push(scheduled_end);
      }
      if (duration !== undefined) {
        setClauses.push(`duration = $${params.length + 1}`);
        params.push(duration);
      }
      if (lesson_type !== undefined) {
        setClauses.push(`lesson_type = $${params.length + 1}`);
        params.push(lesson_type);
      }
      if (status !== undefined) {
        setClauses.push(`status = $${params.length + 1}`);
        params.push(status);
      }
      if (rate !== undefined) {
        setClauses.push(`rate = $${params.length + 1}`);
        params.push(rate);
      }
      if (notes !== undefined) {
        setClauses.push(`notes = $${params.length + 1}`);
        params.push(notes);
      }
      if (is_recurring !== undefined) {
        setClauses.push(`is_recurring = $${params.length + 1}`);
        params.push(is_recurring);
      }
      if (recurrence_type !== undefined) {
        setClauses.push(`recurrence_type = $${params.length + 1}`);
        params.push(recurrence_type);
      }
      if (recurrence_end_date !== undefined) {
        setClauses.push(`recurrence_end_date = $${params.length + 1}`);
        params.push(recurrence_end_date);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      if (setClauses.length === 1) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const result = await query(
        `UPDATE lessons SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating lesson:', error);
      res.status(500).json({ error: 'Failed to update lesson' });
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        `UPDATE lessons SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      res.status(500).json({ error: 'Failed to cancel lesson' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM lessons WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({ error: 'Failed to delete lesson' });
    }
  }
};
