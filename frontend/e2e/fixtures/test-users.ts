/**
 * Test user credentials matching the seed data
 * These users are created by the seed_data.py script
 */

export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  firstName?: string;
  lastName?: string;
}

export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin' as const,
    firstName: 'Admin',
    lastName: 'User',
  },
  teacher: {
    email: 'teacher1@test.com',
    password: 'teacher123',
    role: 'teacher' as const,
    firstName: 'Teacher',
    lastName: 'One',
  },
  student: {
    email: 'student1@test.com',
    password: 'student123',
    role: 'student' as const,
    firstName: 'Student',
    lastName: 'One',
  },
} as const;

/**
 * Get a test user by role
 */
export function getTestUser(role: 'admin' | 'teacher' | 'student'): TestUser {
  return TEST_USERS[role];
}
