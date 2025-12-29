import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/app';
import { query } from '../config/database';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: any;
    }
  }
}

export async function validateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    // Validate JWT (Django uses HS256 by default for JWT)
    const decoded = jwt.verify(token, config.auth.jwtSecret, {
      algorithms: [config.auth.jwtAlgorithm]
    }) as any;

    // Fetch user from database to get current role/permissions
    const user = await getUserById(decoded.user_id);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Attach user to request
    req.user = user;
    req.token = decoded;

    next();
  } catch (error: any) {
    console.error('JWT validation error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function getUserById(userId: string) {
  try {
    const result = await query(
      `SELECT
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        is_staff,
        is_superuser,
        created_at
      FROM users
      WHERE id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
