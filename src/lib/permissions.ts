import type { Role, Action } from "@/types/deadline";

export type RoleOrGuest = Role | 'guest';

/**
 * Ma trận phân quyền tập trung duy nhất của hệ thống:
 * - guest: Người dùng vãng lai chưa đăng nhập
 * - user: Sinh viên đã đăng nhập
 * - admin: Lớp trưởng / Quản trị viên
 */
export const PERMISSION_MATRIX: Record<RoleOrGuest, Record<Action, boolean>> = {
  guest: {
    view_deadline: true,
    mark_completed: false,
    create_deadline: false,
    delete_deadline: false,
  },
  user: {
    view_deadline: true,
    mark_completed: true,
    create_deadline: false,
    delete_deadline: false,
  },
  admin: {
    view_deadline: true,
    mark_completed: true,
    create_deadline: true,
    delete_deadline: true,
  },
};

/**
 * Hàm kiểm tra quyền hạn can(role, action)
 * @param role 'admin' | 'user' | null | undefined
 * @param action Hành động cần kiểm tra
 */
export function can(role: Role | null | undefined, action: Action): boolean {
  const currentRole: RoleOrGuest = role ? role : 'guest';
  const rolePermissions = PERMISSION_MATRIX[currentRole];
  if (!rolePermissions) {
    return false;
  }
  return Boolean(rolePermissions[action]);
}

