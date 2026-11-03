import fs from 'fs/promises';
import path from 'path';
import type { Subject, Deadline, UserAccount } from '@/types/deadline';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SUBJECTS_FILE = path.join(DATA_DIR, 'subjects.json');
const DEADLINES_FILE = path.join(DATA_DIR, 'deadlines.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMPLETIONS_FILE = path.join(DATA_DIR, 'user-completions.json');

// --- SUBJECTS ---
export async function getSubjects(): Promise<Subject[]> {
  try {
    const raw = await fs.readFile(SUBJECTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading subjects.json:', error);
    return [];
  }
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find((s) => s.slug === slug) || null;
}

// --- DEADLINES ---
export async function getDeadlines(): Promise<Deadline[]> {
  try {
    const raw = await fs.readFile(DEADLINES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading deadlines.json:', error);
    return [];
  }
}

export async function getDeadlineById(id: string): Promise<Deadline | null> {
  const deadlines = await getDeadlines();
  return deadlines.find((d) => String(d.id) === String(id)) || null;
}

export async function getDeadlinesBySubject(slug: string): Promise<Deadline[]> {
  const deadlines = await getDeadlines();
  return deadlines.filter((d) => d.subjectSlug === slug);
}

export async function createDeadline(data: Omit<Deadline, 'id' | 'assignedDate'>): Promise<Deadline> {
  const deadlines = await getDeadlines();
  const nextId = (deadlines.reduce((max, d) => Math.max(max, parseInt(d.id) || 0), 0) + 1).toString();
  
  const newDeadline: Deadline = {
    ...data,
    id: nextId,
    assignedDate: new Date().toISOString(),
  };

  deadlines.push(newDeadline);
  await fs.writeFile(DEADLINES_FILE, JSON.stringify(deadlines, null, 2), 'utf-8');
  return newDeadline;
}

export async function deleteDeadline(id: string): Promise<boolean> {
  const deadlines = await getDeadlines();
  const filtered = deadlines.filter((d) => String(d.id) !== String(id));
  if (filtered.length === deadlines.length) {
    return false;
  }
  await fs.writeFile(DEADLINES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');

  // Also remove from user completions
  try {
    const completions = await getAllCompletions();
    let modified = false;
    for (const userId of Object.keys(completions)) {
      if (completions[userId].includes(id)) {
        completions[userId] = completions[userId].filter((did) => did !== id);
        modified = true;
      }
    }
    if (modified) {
      await fs.writeFile(COMPLETIONS_FILE, JSON.stringify(completions, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Error cleaning up completions:', e);
  }

  return true;
}

// --- USERS ---
export async function getUsers(): Promise<UserAccount[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading users.json:', error);
    return [];
  }
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// --- USER COMPLETIONS ---
async function getAllCompletions(): Promise<Record<string, string[]>> {
  try {
    const raw = await fs.readFile(COMPLETIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function getUserCompletions(userId: string): Promise<string[]> {
  const all = await getAllCompletions();
  return all[userId] || [];
}

export async function toggleUserDeadline(userId: string, deadlineId: string): Promise<boolean> {
  const all = await getAllCompletions();
  const userList = all[userId] || [];
  const exists = userList.includes(deadlineId);
  
  if (exists) {
    all[userId] = userList.filter((id) => id !== deadlineId);
  } else {
    all[userId] = [...userList, deadlineId];
  }

  await fs.writeFile(COMPLETIONS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  return !exists; // returns new completion status (true = completed, false = uncompleted)
}

