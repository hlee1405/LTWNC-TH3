export type Role = 'admin' | 'user';

export type Action =
  | 'view_deadline'
  | 'mark_completed'
  | 'create_deadline'
  | 'delete_deadline';

export interface Subject {
  id: string;
  code: string;
  name: string;
  slug: string;
  credits: number;
  instructor: string;
  description: string;
  color: string;
}

export interface Deadline {
  id: string;
  title: string;
  subjectSlug: string;
  subjectName: string;
  subjectCode: string;
  dueDate: string; // ISO 8601
  assignedDate: string;
  description: string;
  format: string; // e.g. "GitHub repository + Báo cáo PDF"
  weight: string; // e.g. "20%"
  priority: 'high' | 'medium' | 'low';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string; // hashed or plaintext fallback
  role: Role;
}

