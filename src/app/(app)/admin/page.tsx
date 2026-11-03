import React from 'react';
import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { getDeadlines, getSubjects } from '@/lib/data';
import AddDeadlineModal from '@/components/AddDeadlineModal';
import DeleteDeadlineButton from '@/components/DeleteDeadlineButton';
import CountdownBadge from '@/components/CountdownBadge';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, Calendar, PlusCircle, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import type { Role } from '@/types/deadline';

export const metadata: Metadata = {
  title: 'Quản trị Deadline | Class Deadline Hub',
  description: 'Trang quản trị dành riêng cho Lớp trưởng: Thêm và Xóa deadline của lớp.',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Route: /admin
 * Chiến lược Render: SSR (Server-Side Rendering)
 * Cấu hình: export const dynamic = 'force-dynamic';
 *
 * Lý do chọn SSR & Cơ chế Bảo vệ Đa Tầng (Defense-in-Depth):
 * 1. Phân quyền cấp độ Trang (Page Component Guard):
 *    Ngay đầu Server Component, trang chủ động gọi `await auth()` và kiểm tra quyền thông qua hàm `can(role, 'create_deadline')`.
 *    Nếu người dùng chưa đăng nhập, chuyển về /login. Nếu là sinh viên thường (user), chuyển ngay về /403.
 *    Điều này đảm bảo nguyên lý Zero Trust: Không phụ thuộc duy nhất vào Middleware Edge Guard (phòng trường hợp
 *    cấu hình matcher bị bypass, header proxy giả mạo hay lỗi runtime ở Edge).
 * 2. Cập nhật tức thời: Thao tác thêm / xóa của Lớp trưởng cần được phản ánh chính xác từng giây trên giao diện quản trị.
 */
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  const userRole = (session?.user?.role as Role | undefined);

  // Lớp phòng thủ 2: Server Component Guard
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (!can(userRole, 'create_deadline') || !can(userRole, 'delete_deadline')) {
    redirect('/403');
  }

  const [deadlines, subjects] = await Promise.all([
    getDeadlines(),
    getSubjects(),
  ]);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Quản trị */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge-role admin">Quản trị viên</span>
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            Quản Lý Deadline Của Lớp
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Tài khoản: <strong>{session.user.name?.replace(/\s*\([^)]*\)/g, '').trim()}</strong> ({session.user.email}).
          </p>
        </div>

        {/* Nút Thêm Deadline Modal */}
        <AddDeadlineModal subjects={subjects} />
      </div>

      {/* Bảng Quản lý Danh sách Deadline */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Danh sách tất cả Deadline ({deadlines.length})
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Mã & Tiêu đề</th>
                <th style={{ padding: '0.75rem 1rem' }}>Môn học</th>
                <th style={{ padding: '0.75rem 1rem' }}>Hạn chót</th>
                <th style={{ padding: '0.75rem 1rem' }}>Đếm ngược</th>
                <th style={{ padding: '0.75rem 1rem' }}>Trọng số</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                >
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge-priority ${item.priority}`}>
                        {item.priority === 'high' ? 'Cao' : item.priority === 'medium' ? 'TB' : 'Thấp'}
                      </span>
                      <Link
                        href={`/deadlines/${item.id}`}
                        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                        className="hover-underline"
                      >
                        {item.title}
                      </Link>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Hình thức: {item.format}
                    </div>
                  </td>

                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 600 }}>{item.subjectCode}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.subjectName}
                    </div>
                  </td>

                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    {new Date(item.dueDate).toLocaleString('vi-VN')}
                  </td>

                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <CountdownBadge dueDate={item.dueDate} />
                  </td>

                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {item.weight}
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Link
                        href={`/deadlines/${item.id}`}
                        className="btn btn-outline btn-sm"
                        title="Xem trang chi tiết"
                      >
                        <ExternalLink size={14} />
                      </Link>

                      <DeleteDeadlineButton
                        deadlineId={item.id}
                        deadlineTitle={item.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

