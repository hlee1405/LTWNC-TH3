import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { Subject, Deadline, UserAccount } from '@/types/deadline';
import defaultSubjects from '@/data/subjects.json';
import defaultDeadlines from '@/data/deadlines.json';
import defaultUsers from '@/data/users.json';
import defaultCompletions from '@/data/user-completions.json';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SUBJECTS_FILE = path.join(DATA_DIR, 'subjects.json');
const DEADLINES_FILE = path.join(DATA_DIR, 'deadlines.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMPLETIONS_FILE = path.join(DATA_DIR, 'user-completions.json');

// Đường dẫn lưu trữ dự phòng có quyền ghi trên Vercel Serverless
const TMP_DIR = os.tmpdir();
const TMP_DEADLINES_FILE = path.join(TMP_DIR, 'class-hub-deadlines.json');
const TMP_COMPLETIONS_FILE = path.join(TMP_DIR, 'class-hub-user-completions.json');

// Bộ nhớ tạm Runtime
let memoryDeadlines: Deadline[] | null = null;
let memoryCompletions: Record<string, string[]> | null = null;

// --- SUBJECTS ---
export async function getSubjects(): Promise<Subject[]> {
  try {
    const raw = await fs.readFile(SUBJECTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return defaultSubjects as Subject[];
  }
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find((s) => s.slug === slug) || null;
}

// --- DEADLINES ---
export async function getDeadlines(): Promise<Deadline[]> {
  let list: Deadline[] = [];

  if (memoryDeadlines) {
    list = [...memoryDeadlines];
  } else {
    // 1. Thử đọc từ /tmp (nếu đã từng được ghi trên Vercel Serverless)
    let loaded = false;
    try {
      const raw = await fs.readFile(TMP_DEADLINES_FILE, 'utf-8');
      list = JSON.parse(raw);
      memoryDeadlines = list;
      loaded = true;
    } catch {}

    if (!loaded) {
      // 2. Thử đọc từ src/data
      try {
        const raw = await fs.readFile(DEADLINES_FILE, 'utf-8');
        list = JSON.parse(raw);
        memoryDeadlines = list;
      } catch (error) {
        list = [...(defaultDeadlines as Deadline[])];
        memoryDeadlines = list;
      }
    }
  }

  // 3. Đồng bộ cookie nếu có (xử lý serverless đa container trên Vercel)
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const customCookie = cookieStore.get('custom_deadlines')?.value;
    const deletedCookie = cookieStore.get('deleted_deadlines')?.value;

    const deletedIds: string[] = deletedCookie ? JSON.parse(deletedCookie) : [];
    const customDeadlines: Deadline[] = customCookie ? JSON.parse(customCookie) : [];

    if (deletedIds.length > 0) {
      list = list.filter((d) => !deletedIds.includes(String(d.id)));
    }

    if (customDeadlines.length > 0) {
      for (const cd of customDeadlines) {
        if (!list.some((d) => String(d.id) === String(cd.id))) {
          list.push(cd);
        }
      }
    }
  } catch {
    // Bỏ qua an toàn khi chạy trong build tĩnh SSG
  }

  return list;
}

export async function getDeadlineById(id: string): Promise<Deadline | null> {
  const deadlines = await getDeadlines();
  return deadlines.find((d) => String(d.id) === String(id)) || null;
}

export async function getDeadlinesBySubject(slug: string): Promise<Deadline[]> {
  const deadlines = await getDeadlines();
  return deadlines.filter((d) => d.subjectSlug === slug);
}

async function saveDeadlines(data: Deadline[]): Promise<void> {
  memoryDeadlines = data;
  try {
    // Thử ghi trực tiếp vào thư mục mã nguồn (Local)
    await fs.writeFile(DEADLINES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Môi trường Vercel (Read-only filesystem): Ghi vào /tmp
    try {
      await fs.writeFile(TMP_DEADLINES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not persist deadlines to disk/tmp:', e);
    }
  }
}

export async function createDeadline(data: Omit<Deadline, 'id' | 'assignedDate'>): Promise<Deadline> {
  const deadlines = await getDeadlines();
  const nextId = (deadlines.reduce((max, d) => Math.max(max, parseInt(d.id) || 0), 0) + 1).toString();
  
  const newDeadline: Deadline = {
    ...data,
    id: nextId,
    assignedDate: new Date().toISOString(),
  };

  const updated = [...deadlines, newDeadline];
  await saveDeadlines(updated);
  return newDeadline;
}

export async function deleteDeadline(id: string): Promise<boolean> {
  const deadlines = await getDeadlines();
  const filtered = deadlines.filter((d) => String(d.id) !== String(id));
  if (filtered.length === deadlines.length) {
    return false;
  }
  await saveDeadlines(filtered);

  // Dọn dẹp cả trong danh sách đánh dấu hoàn thành
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
      await saveCompletions(completions);
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
    return defaultUsers as UserAccount[];
  }
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// --- USER COMPLETIONS ---
async function getAllCompletions(): Promise<Record<string, string[]>> {
  if (memoryCompletions) {
    return memoryCompletions;
  }

  // 1. Thử đọc từ /tmp (Vercel Serverless)
  try {
    const raw = await fs.readFile(TMP_COMPLETIONS_FILE, 'utf-8');
    memoryCompletions = JSON.parse(raw);
    return memoryCompletions!;
  } catch {}

  // 2. Thử đọc từ src/data
  try {
    const raw = await fs.readFile(COMPLETIONS_FILE, 'utf-8');
    memoryCompletions = JSON.parse(raw);
    return memoryCompletions!;
  } catch {
    memoryCompletions = { ...(defaultCompletions as Record<string, string[]>) };
    return memoryCompletions;
  }
}

async function saveCompletions(data: Record<string, string[]>): Promise<void> {
  memoryCompletions = data;
  try {
    // Thử ghi trực tiếp vào src/data (khi chạy local)
    await fs.writeFile(COMPLETIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Môi trường Vercel (Read-only filesystem): Ghi vào /tmp
    try {
      await fs.writeFile(TMP_COMPLETIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not persist completions to disk/tmp:', e);
    }
  }
}

export async function getUserCompletions(userId: string): Promise<string[]> {
  const all = await getAllCompletions();
  return all[userId] || [];
}

export async function toggleUserDeadline(userId: string, deadlineId: string): Promise<boolean> {
  const all = await getAllCompletions();
  const currentList = all[userId] || [];
  const exists = currentList.includes(deadlineId);

  const updatedList = exists
    ? currentList.filter((id) => id !== deadlineId)
    : [...currentList, deadlineId];

  const updatedAll = {
    ...all,
    [userId]: updatedList,
  };

  await saveCompletions(updatedAll);
  return !exists;
}
