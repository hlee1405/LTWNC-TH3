import { can } from '../src/lib/permissions';

describe('Kiểm thử Ma trận Phân quyền can(role, action)', () => {
  describe('Vai trò Khách (guest / null / undefined)', () => {
    it('Guest ĐƯỢC PHÉP xem deadline', () => {
      expect(can(null, 'view_deadline')).toBe(true);
      expect(can(undefined, 'view_deadline')).toBe(true);
    });

    it('Guest KHÔNG ĐƯỢC PHÉP đánh dấu đã xong', () => {
      expect(can(null, 'mark_completed')).toBe(false);
      expect(can(undefined, 'mark_completed')).toBe(false);
    });

    it('Guest KHÔNG ĐƯỢC PHÉP thêm deadline', () => {
      expect(can(null, 'create_deadline')).toBe(false);
      expect(can(undefined, 'create_deadline')).toBe(false);
    });

    it('Guest KHÔNG ĐƯỢC PHÉP xoá deadline', () => {
      expect(can(null, 'delete_deadline')).toBe(false);
      expect(can(undefined, 'delete_deadline')).toBe(false);
    });
  });

  describe('Vai trò Sinh viên (user)', () => {
    it('User ĐƯỢC PHÉP xem deadline', () => {
      expect(can('user', 'view_deadline')).toBe(true);
    });

    it('User ĐƯỢC PHÉP đánh dấu đã xong', () => {
      expect(can('user', 'mark_completed')).toBe(true);
    });

    it('User KHÔNG ĐƯỢC PHÉP thêm deadline', () => {
      expect(can('user', 'create_deadline')).toBe(false);
    });

    it('User KHÔNG ĐƯỢC PHÉP xoá deadline', () => {
      expect(can('user', 'delete_deadline')).toBe(false);
    });
  });

  describe('Vai trò Lớp trưởng / Admin (admin)', () => {
    it('Admin ĐƯỢC PHÉP xem deadline', () => {
      expect(can('admin', 'view_deadline')).toBe(true);
    });

    it('Admin ĐƯỢC PHÉP đánh dấu đã xong', () => {
      expect(can('admin', 'mark_completed')).toBe(true);
    });

    it('Admin ĐƯỢC PHÉP thêm deadline', () => {
      expect(can('admin', 'create_deadline')).toBe(true);
    });

    it('Admin ĐƯỢC PHÉP xoá deadline', () => {
      expect(can('admin', 'delete_deadline')).toBe(true);
    });
  });
});

