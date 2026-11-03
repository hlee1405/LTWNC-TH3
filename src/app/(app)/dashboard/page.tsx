import React from 'react';
import { auth } from '@/lib/auth';
import { getDeadlines, getUserCompletions, getSubjects } from '@/lib/data';
import CountdownBadge from '@/components/CountdownBadge';
import ToggleCompleteButton from '@/components/ToggleCompleteButton';
import Link from 'next/link';
import { CheckCircle2, Clock, AlertTriangle, Calendar, ArrowRight, BarChart3, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Bàn làm việc | Class Deadline Hub',
  description: 'Trang cá nhân quản lý và đánh dấu deadline đã hoàn thành của sinh viên.',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Route: /dashboard
 * Chiến lược Render: SSR (Server-Side Rendering)
 * Cấu hình: export const dynamic = 'force-dynamic';
 * Lý do chọn SSR: Bàn làm việc phụ thuộc trực tiếp vào phiên đăng nhập của từng sinh viên (Session JWT)
 * và danh sách các deadline cá nhân đã hoàn thành (user-completions). Mỗi người dùng có một trạng thái riêng biệt,
 * do đó trang không thể sinh tĩnh (Static) mà bắt buộc phải render động từ máy chủ (Server-Side) tại thời điểm nhận request,
 * kèm thẻ meta chặn công cụ tìm kiếm cào dữ liệu riêng tư (robots: noindex, nofollow).
 */
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const userId = session.user.id;
  const [deadlines, userCompletions, subjects] = await Promise.all([
    getDeadlines(),
    getUserCompletions(userId),
    getSubjects(),
  ]);

  const now = Date.now();
  const completedDeadlines = deadlines.filter((d) => userCompletions.includes(d.id));
  const pendingDeadlines = deadlines.filter((d) => !userCompletions.includes(d.id));
  const overdueDeadlines = pendingDeadlines.filter((d) => new Date(d.dueDate).getTime() < now);

  const percentCompleted = deadlines.length > 0
    ? Math.round((completedDeadlines.length / deadlines.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Bàn làm việc */}
      <div>
        <div style={{ marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Phiên đăng nhập: {session.user.email}
          </span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
          Xin chào, {session.user.name?.replace(/\s*\([^)]*\)/g, '').trim() || 'Sinh viên'}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Quản lý tiến độ bài tập và đồ án cá nhân.
        </p>
      </div>

      {/* Thẻ Thống kê Tiến độ (KPI Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tổng Deadline</span>
            <Calendar size={18} style={{ color: 'var(--secondary)' }} />
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{deadlines.length}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trong 4 môn học kỳ này</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Đã Hoàn Thành</span>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
            {completedDeadlines.length}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đạt {percentCompleted}% tổng số bài</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cần Hoàn Thành</span>
            <Clock size={18} style={{ color: 'var(--warning)' }} />
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)' }}>
            {pendingDeadlines.length}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bài tập đang chờ nộp</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Đã Quá Hạn</span>
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }}>
            {overdueDeadlines.length}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chưa nộp kịp thời hạn</p>
        </div>
      </div>

      {/* Thanh Tiến độ Trực quan */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tiến độ hoàn thành toàn bộ học kỳ</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>
            {completedDeadlines.length} / {deadlines.length} ({percentCompleted}%)
          </span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${percentCompleted}%`,
              height: '100%',
              backgroundColor: 'var(--success)',
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Danh sách Deadline Cần làm gấp */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>
          Danh sách Deadline Cần Làm ({pendingDeadlines.length})
        </h2>

        {pendingDeadlines.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--success)', margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tuyệt vời! Bạn đã hoàn thành toàn bộ deadline.</p>
            <p style={{ fontSize: '0.875rem' }}>Hãy tiếp tục duy trì phong độ nhé!</p>
          </div>
        ) : (
          <div className="grid-cards">
            {pendingDeadlines.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${item.priority === 'high' ? 'var(--danger)' : item.priority === 'medium' ? 'var(--warning)' : 'var(--secondary)'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>
                      {item.subjectCode}
                    </span>
                    <CountdownBadge dueDate={item.dueDate} />
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Link href={`/deadlines/${item.id}`} style={{ color: 'inherit' }}>
                      {item.title}
                    </Link>
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <Link href={`/deadlines/${item.id}`} className="btn btn-outline btn-sm" style={{ gap: '0.25rem' }}>
                    <span>Chi tiết</span>
                    <ArrowRight size={14} />
                  </Link>

                  <ToggleCompleteButton
                    deadlineId={item.id}
                    isCompleted={false}
                    isLoggedIn={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danh sách Deadline Đã Hoàn Thành */}
      {completedDeadlines.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--success)' }}>
            Đã Hoàn Thành ({completedDeadlines.length})
          </h2>

          <div className="grid-cards">
            {completedDeadlines.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  opacity: 0.9,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {item.subjectCode}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={14} />
                      <span>Đã nộp xong</span>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <Link href={`/deadlines/${item.id}`} style={{ color: 'inherit' }}>
                      {item.title}
                    </Link>
                  </h3>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <Link href={`/deadlines/${item.id}`} className="btn btn-outline btn-sm">
                    Xem lại
                  </Link>
                  <ToggleCompleteButton
                    deadlineId={item.id}
                    isCompleted={true}
                    isLoggedIn={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

