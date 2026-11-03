'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { createDeadline, deleteDeadline, toggleUserDeadline, getSubjects } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { Role } from '@/types/deadline';

export interface ActionState {
  success?: boolean;
  error?: string;
}

/**
 * Server Action: Tạo deadline mới (chỉ admin có quyền)
 */
export async function createDeadlineAction(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userRole = (session?.user?.role as Role | undefined);

  // Kiểm tra quyền hạn bằng hàm can()
  if (!can(userRole, 'create_deadline')) {
    return {
      success: false,
      error: '403 Forbidden: Bạn không có quyền thêm deadline mới vào hệ thống.',
    };
  }

  // Thu thập và kiểm tra tính hợp lệ của dữ liệu đầu vào (Input Validation)
  const title = (formData.get('title') as string)?.trim();
  const subjectSlug = (formData.get('subjectSlug') as string)?.trim();
  const dueDate = (formData.get('dueDate') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || 'Không có mô tả chi tiết.';
  const format = (formData.get('format') as string)?.trim() || 'Nộp trực tuyến';
  const weight = (formData.get('weight') as string)?.trim() || '10%';
  const priority = (formData.get('priority') as 'high' | 'medium' | 'low') || 'medium';

  if (!title || title.length < 3) {
    return { success: false, error: 'Tiêu đề deadline phải có ít nhất 3 ký tự.' };
  }

  const subjects = await getSubjects();
  const matchedSubject = subjects.find((s) => s.slug === subjectSlug);
  if (!matchedSubject) {
    return { success: false, error: 'Môn học được chọn không hợp lệ.' };
  }

  if (!dueDate || isNaN(Date.parse(dueDate))) {
    return { success: false, error: 'Thời hạn nộp bài (Due date) không hợp lệ.' };
  }

  try {
    const newDeadline = await createDeadline({
      title,
      subjectSlug: matchedSubject.slug,
      subjectName: matchedSubject.name,
      subjectCode: matchedSubject.code,
      dueDate: new Date(dueDate).toISOString(),
      description,
      format,
      weight,
      priority,
    });

    // Đồng bộ vào cookie để các Vercel serverless lambda khác đều thấy ngay lập tức
    try {
      const cookieStore = await cookies();
      const existingCookie = cookieStore.get('custom_deadlines')?.value;
      const customList = existingCookie ? JSON.parse(existingCookie) : [];
      customList.push(newDeadline);
      cookieStore.set('custom_deadlines', JSON.stringify(customList), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    } catch (e) {
      console.warn('Could not set custom_deadlines cookie:', e);
    }

    // Revalidate On-Demand theo yêu cầu: làm mới ngay lập tức
    revalidatePath('/deadlines');
    revalidatePath(`/deadlines/${newDeadline.id}`);
    revalidatePath(`/subjects/${matchedSubject.slug}`);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error creating deadline:', error);
    return { success: false, error: 'Có lỗi xảy ra khi lưu deadline vào hệ thống.' };
  }
}

/**
 * Server Action: Xoá deadline (chỉ admin có quyền)
 */
export async function deleteDeadlineAction(deadlineId: string): Promise<ActionState> {
  const session = await auth();
  const userRole = (session?.user?.role as Role | undefined);

  if (!can(userRole, 'delete_deadline')) {
    return {
      success: false,
      error: '403 Forbidden: Bạn không có quyền xoá deadline.',
    };
  }

  if (!deadlineId) {
    return { success: false, error: 'ID deadline không hợp lệ.' };
  }

  try {
    const deleted = await deleteDeadline(deadlineId);
    if (!deleted) {
      return { success: false, error: 'Không tìm thấy deadline cần xoá.' };
    }

    // Cập nhật cookie đồng bộ các lambda
    try {
      const cookieStore = await cookies();
      const customCookie = cookieStore.get('custom_deadlines')?.value;
      if (customCookie) {
        const filtered = JSON.parse(customCookie).filter((d: { id: string }) => String(d.id) !== String(deadlineId));
        cookieStore.set('custom_deadlines', JSON.stringify(filtered), {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        });
      }
      const deletedCookie = cookieStore.get('deleted_deadlines')?.value;
      const deletedList: string[] = deletedCookie ? JSON.parse(deletedCookie) : [];
      if (!deletedList.includes(String(deadlineId))) {
        deletedList.push(String(deadlineId));
      }
      cookieStore.set('deleted_deadlines', JSON.stringify(deletedList), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    } catch (e) {
      console.warn('Could not update deleted_deadlines cookie:', e);
    }

    // Revalidate các trang liên quan để cập nhật dữ liệu ngay lập tức
    revalidatePath('/deadlines');
    revalidatePath(`/deadlines/${deadlineId}`);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting deadline:', error);
    return { success: false, error: 'Không thể xoá deadline do lỗi hệ thống.' };
  }
}

/**
 * Server Action: Đánh dấu deadline đã xong / chưa xong (Sinh viên & Admin)
 */
export async function toggleCompleteAction(deadlineId: string): Promise<ActionState> {
  const session = await auth();
  const userRole = (session?.user?.role as Role | undefined);
  const userId = session?.user?.id;

  if (!userId || !can(userRole, 'mark_completed')) {
    return {
      success: false,
      error: 'Vui lòng đăng nhập để đánh dấu trạng thái hoàn thành.',
    };
  }

  try {
    await toggleUserDeadline(userId, deadlineId);
    revalidatePath('/dashboard');
    revalidatePath('/deadlines');
    return { success: true };
  } catch (error) {
    console.error('Error toggling deadline completion:', error);
    return { success: false, error: 'Không thể cập nhật trạng thái hoàn thành.' };
  }
}

