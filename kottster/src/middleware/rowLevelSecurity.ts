import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      studioFilter?: any;
    }
  }
}

export async function filterByStudio(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Superusers and admins see all data
  if (user.is_superuser || user.role === 'admin') {
    req.studioFilter = null; // No filter
    return next();
  }

  try {
    // Teachers see only their studio's data
    if (user.role === 'teacher') {
      const teacher = await getTeacherByUserId(user.id);
      if (teacher) {
        req.studioFilter = { studio_id: teacher.studio_id };
      } else {
        req.studioFilter = { studio_id: null }; // No studio = no data
      }
      return next();
    }

    // Students see only their own data
    if (user.role === 'student') {
      const student = await getStudentByUserId(user.id);
      if (student) {
        req.studioFilter = {
          student_id: student.id,
          user_id: user.id
        };
      } else {
        req.studioFilter = { student_id: null }; // No student = no data
      }
      return next();
    }

    // Parents see their children's data
    if (user.role === 'parent') {
      const children = await getChildrenByParentUserId(user.id);
      if (children.length > 0) {
        req.studioFilter = {
          student_id_in: children.map(c => c.id)
        };
      } else {
        req.studioFilter = { student_id: null }; // No children = no data
      }
      return next();
    }

    // Default: no data access
    req.studioFilter = { studio_id: null };
    next();
  } catch (error) {
    console.error('Error in filterByStudio middleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTeacherByUserId(userId: string) {
  try {
    const result = await query(
      'SELECT id, studio_id, user_id FROM teachers WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return null;
  }
}

async function getStudentByUserId(userId: string) {
  try {
    const result = await query(
      'SELECT id, user_id FROM students WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}

async function getChildrenByParentUserId(userId: string) {
  try {
    // Assuming there's a family relationship table
    const result = await query(
      `SELECT s.id, s.user_id
       FROM students s
       JOIN families f ON s.family_id = f.id
       WHERE f.parent_user_id = $1`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching children:', error);
    return [];
  }
}
