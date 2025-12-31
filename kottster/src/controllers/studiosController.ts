import { Request, Response } from 'express';
import { query } from '../config/database';

export const studiosController = {
  async list(req: Request, res: Response) {
    try {
      const { search, _page = '1', _perPage = '25', _sort = 'created_at', _order = 'DESC' } = req.query;

      const page = parseInt(_page as string);
      const perPage = parseInt(_perPage as string);
      const offset = (page - 1) * perPage;

      const whereClauses: string[] = [];
      const params: any[] = [];

      if (search) {
        whereClauses.push(`(name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countResult = await query(
        `SELECT COUNT(*) as total FROM studios ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      const dataResult = await query(
        `SELECT s.id, s.name, s.email, s.phone, s.website, s.address,
                s.timezone, s.currency, s.settings, s.layout_data,
                s.owner_id, u.email as owner_email, u.first_name || ' ' || u.last_name as owner_name,
                s.created_at, s.updated_at
         FROM studios s
         LEFT JOIN users u ON s.owner_id = u.id
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
      console.error('Error listing studios:', error);
      res.status(500).json({ error: 'Failed to fetch studios' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT s.id, s.name, s.email, s.phone, s.website, s.address,
                s.timezone, s.currency, s.settings, s.layout_data,
                s.owner_id, u.email as owner_email,
                u.first_name || ' ' || u.last_name as owner_name,
                s.created_at, s.updated_at
         FROM studios s
         LEFT JOIN users u ON s.owner_id = u.id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching studio:', error);
      res.status(500).json({ error: 'Failed to fetch studio' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const {
        name,
        owner_id,
        email = '',
        phone = '',
        website = '',
        address = '',
        timezone = 'UTC',
        currency = 'USD',
        settings = {}
      } = req.body;

      if (!name || !owner_id) {
        return res.status(400).json({ error: 'Name and owner are required' });
      }

      const result = await query(
        `INSERT INTO studios (name, owner_id, email, phone, website, address, timezone, currency, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, owner_id, email, phone, website, address, timezone, currency, settings]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating studio:', error);
      res.status(500).json({ error: 'Failed to create studio' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, owner_id, email, phone, website, address, timezone, currency, settings, layout_data } = req.body;

      const setClauses: string[] = [];
      const params: any[] = [];

      if (name !== undefined) {
        setClauses.push(`name = $${params.length + 1}`);
        params.push(name);
      }
      if (owner_id !== undefined) {
        setClauses.push(`owner_id = $${params.length + 1}`);
        params.push(owner_id);
      }
      if (email !== undefined) {
        setClauses.push(`email = $${params.length + 1}`);
        params.push(email);
      }
      if (phone !== undefined) {
        setClauses.push(`phone = $${params.length + 1}`);
        params.push(phone);
      }
      if (website !== undefined) {
        setClauses.push(`website = $${params.length + 1}`);
        params.push(website);
      }
      if (address !== undefined) {
        setClauses.push(`address = $${params.length + 1}`);
        params.push(address);
      }
      if (timezone !== undefined) {
        setClauses.push(`timezone = $${params.length + 1}`);
        params.push(timezone);
      }
      if (currency !== undefined) {
        setClauses.push(`currency = $${params.length + 1}`);
        params.push(currency);
      }
      if (settings !== undefined) {
        setClauses.push(`settings = $${params.length + 1}`);
        params.push(settings);
      }
      if (layout_data !== undefined) {
        setClauses.push(`layout_data = $${params.length + 1}`);
        params.push(layout_data);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      if (setClauses.length === 1) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const result = await query(
        `UPDATE studios SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating studio:', error);
      res.status(500).json({ error: 'Failed to update studio' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM studios WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting studio:', error);
      res.status(500).json({ error: 'Failed to delete studio' });
    }
  }
};
