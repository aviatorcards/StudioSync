import { Request, Response } from 'express';
import { query } from '../config/database';

export const featureFlagsController = {
  // List all feature flags with optional filtering
  async list(req: Request, res: Response) {
    try {
      const { search, is_active, category, _page = '1', _perPage = '25', _sort = 'created_at', _order = 'DESC' } = req.query;

      const page = parseInt(_page as string);
      const perPage = parseInt(_perPage as string);
      const offset = (page - 1) * perPage;

      // Build WHERE clause dynamically
      const whereClauses: string[] = [];
      const params: any[] = [];

      if (search) {
        whereClauses.push(`(key ILIKE $${params.length + 1} OR name ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      if (is_active !== undefined) {
        whereClauses.push(`is_active = $${params.length + 1}`);
        params.push(is_active === 'true');
      }

      if (category) {
        whereClauses.push(`category = $${params.length + 1}`);
        params.push(category);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Count query
      const countResult = await query(
        `SELECT COUNT(*) as total FROM feature_flags ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      // Data query
      const sortField = _sort as string;
      const sortOrder = _order as string;

      const dataResult = await query(
        `SELECT id, key, name, description, flag_type, is_active,
                rollout_percentage, scope, value_boolean, value_string,
                value_number, value_json, category, target_roles,
                created_at, updated_at
         FROM feature_flags ${whereClause}
         ORDER BY ${sortField} ${sortOrder}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, perPage, offset]
      );

      res.json({
        data: dataResult.rows,
        total: total
      });
    } catch (error) {
      console.error('Error listing feature flags:', error);
      res.status(500).json({ error: 'Failed to fetch feature flags' });
    }
  },

  // Get single feature flag by ID
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT id, key, name, description, flag_type, is_active,
                rollout_percentage, scope, value_boolean, value_string,
                value_number, value_json, category, target_roles,
                created_at, updated_at
         FROM feature_flags
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Feature flag not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching feature flag:', error);
      res.status(500).json({ error: 'Failed to fetch feature flag' });
    }
  },

  // Create new feature flag
  async create(req: Request, res: Response) {
    try {
      const {
        key,
        name,
        description = '',
        flag_type = 'boolean',
        is_active = true,
        rollout_percentage = 100,
        scope = 'global',
        value_boolean = false,
        value_string = '',
        value_number = null,
        value_json = {},
        category = '',
        target_roles = []
      } = req.body;

      // Validate required fields
      if (!key || !name) {
        return res.status(400).json({ error: 'Key and name are required' });
      }

      // Check if key already exists
      const existingFlag = await query(
        'SELECT id FROM feature_flags WHERE key = $1',
        [key]
      );

      if (existingFlag.rows.length > 0) {
        return res.status(409).json({ error: 'Feature flag with this key already exists' });
      }

      const result = await query(
        `INSERT INTO feature_flags (
          key, name, description, flag_type, is_active, rollout_percentage,
          scope, value_boolean, value_string, value_number, value_json,
          category, target_roles
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          key, name, description, flag_type, is_active, rollout_percentage,
          scope, value_boolean, value_string, value_number, value_json,
          category, target_roles
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating feature flag:', error);
      res.status(500).json({ error: 'Failed to create feature flag' });
    }
  },

  // Update existing feature flag
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        key,
        name,
        description,
        flag_type,
        is_active,
        rollout_percentage,
        scope,
        value_boolean,
        value_string,
        value_number,
        value_json,
        category,
        target_roles
      } = req.body;

      // Build SET clause dynamically
      const setClauses: string[] = [];
      const params: any[] = [];

      if (key !== undefined) {
        setClauses.push(`key = $${params.length + 1}`);
        params.push(key);
      }
      if (name !== undefined) {
        setClauses.push(`name = $${params.length + 1}`);
        params.push(name);
      }
      if (description !== undefined) {
        setClauses.push(`description = $${params.length + 1}`);
        params.push(description);
      }
      if (flag_type !== undefined) {
        setClauses.push(`flag_type = $${params.length + 1}`);
        params.push(flag_type);
      }
      if (is_active !== undefined) {
        setClauses.push(`is_active = $${params.length + 1}`);
        params.push(is_active);
      }
      if (rollout_percentage !== undefined) {
        setClauses.push(`rollout_percentage = $${params.length + 1}`);
        params.push(rollout_percentage);
      }
      if (scope !== undefined) {
        setClauses.push(`scope = $${params.length + 1}`);
        params.push(scope);
      }
      if (value_boolean !== undefined) {
        setClauses.push(`value_boolean = $${params.length + 1}`);
        params.push(value_boolean);
      }
      if (value_string !== undefined) {
        setClauses.push(`value_string = $${params.length + 1}`);
        params.push(value_string);
      }
      if (value_number !== undefined) {
        setClauses.push(`value_number = $${params.length + 1}`);
        params.push(value_number);
      }
      if (value_json !== undefined) {
        setClauses.push(`value_json = $${params.length + 1}`);
        params.push(value_json);
      }
      if (category !== undefined) {
        setClauses.push(`category = $${params.length + 1}`);
        params.push(category);
      }
      if (target_roles !== undefined) {
        setClauses.push(`target_roles = $${params.length + 1}`);
        params.push(target_roles);
      }

      setClauses.push(`updated_at = NOW()`);
      params.push(id); // Last param is ID

      if (setClauses.length === 1) { // Only updated_at
        return res.status(400).json({ error: 'No fields to update' });
      }

      const result = await query(
        `UPDATE feature_flags
         SET ${setClauses.join(', ')}
         WHERE id = $${params.length}
         RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Feature flag not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating feature flag:', error);
      res.status(500).json({ error: 'Failed to update feature flag' });
    }
  },

  // Delete feature flag
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM feature_flags WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Feature flag not found' });
      }

      res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      res.status(500).json({ error: 'Failed to delete feature flag' });
    }
  }
};
