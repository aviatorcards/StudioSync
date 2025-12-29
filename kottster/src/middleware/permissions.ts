import { Request, Response, NextFunction } from 'express';

// Permission matrix for all resources
const PERMISSIONS: Record<string, Record<string, string[]>> = {
  users: {
    view: ['admin', 'teacher'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin']
  },
  studios: {
    view: ['admin'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin']
  },
  teachers: {
    view: ['admin', 'teacher'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin']
  },
  students: {
    view: ['admin', 'teacher'],
    create: ['admin', 'teacher'],
    edit: ['admin', 'teacher'],
    delete: ['admin']
  },
  lessons: {
    view: ['admin', 'teacher', 'student'],
    create: ['admin', 'teacher'],
    edit: ['admin', 'teacher'],
    delete: ['admin']
  },
  invoices: {
    view: ['admin'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin']
  },
  payments: {
    view: ['admin'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin']
  },
  resources: {
    view: ['admin', 'teacher', 'student'],
    create: ['admin', 'teacher'],
    edit: ['admin', 'teacher'],
    delete: ['admin']
  },
  inventory: {
    view: ['admin', 'teacher'],
    create: ['admin'],
    edit: ['admin', 'teacher'],
    delete: ['admin']
  },
  messaging: {
    view: ['admin', 'teacher', 'student'],
    create: ['admin', 'teacher', 'student'],
    edit: ['admin', 'teacher', 'student'],
    delete: ['admin', 'teacher']
  },
  notifications: {
    view: ['admin', 'teacher', 'student'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin']
  },
  feature_flags: {
    view: ['admin'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin']
  }
};

export function checkPermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Superusers have all permissions
    if (user.is_superuser) {
      return next();
    }

    const allowedRoles = PERMISSIONS[resource]?.[action];

    if (!allowedRoles) {
      console.warn(`No permission defined for resource: ${resource}, action: ${action}`);
      return res.status(403).json({ error: 'Permission not defined' });
    }

    if (!allowedRoles.includes(user.role)) {
      console.warn(`Permission denied for user ${user.email} (role: ${user.role}) on ${resource}:${action}`);
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: user.role
      });
    }

    next();
  };
}

// Helper to check if user has permission (for use in code)
export function hasPermission(user: any, resource: string, action: string): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;

  const allowedRoles = PERMISSIONS[resource]?.[action];
  if (!allowedRoles) return false;

  return allowedRoles.includes(user.role);
}
