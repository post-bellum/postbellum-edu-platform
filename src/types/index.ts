export * from './database.types';
export * from './lesson.types';

// Additional app-specific types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}
