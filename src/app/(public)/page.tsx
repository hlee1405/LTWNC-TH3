import React from 'react';
import Link from 'next/link';
import { getSubjects, getDeadlines } from '@/lib/data';
import { BookOpen, Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import CountdownBadge from '@/components/CountdownBadge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trang chủ | Class Deadline Hub',
  description: 'Theo dõi hạn nộp bài tập lớn và đồ án các môn học trong kỳ.',
};

/**
 * Route: /
 * Chiến lược Render: SSG (Static Site Generation)
 * Lý do chọn SSG: Trang chủ chứa nội dung giới thiệu chung, danh mục 4 môn học và số liệu tổng quan
 * không đổi theo từng người dùng. Việc render tĩnh (Static HTML) tại thời điểm build mang lại tốc độ
 * tải trang tối đa (TTFB ~ 0ms), tối ưu chi phí hạ tầng máy chủ và đạt điểm số SEO / Lighthouse 100 tuyệt đối.
 */
export default async function HomePage() {
  const subjects = await getSubjects();
  const deadlines = await getDeadlines();

  // 3 deadline gần nhất
  const upcomingDeadlines = [...deadlines]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Kỳ 1 &bull; Năm học 2026-2027</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: '#ffffff' }}>
            Class Deadline Hub
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2rem' }}>
            Cổng thông tin theo dõi tiến độ bài tập và đồ án của lớp.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/deadlines" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              <span>Xem Tất Cả Deadline ({deadlines.length})</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              <span>Bàn làm việc của tôi</span>
            </Link>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1.5rem',
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>{subjects.length}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Môn học trong kỳ</p>
          </div>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#facc15' }}>{deadlines.length}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Deadline đang theo dõi</p>
          </div>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171' }}>{upcomingDeadlines.length}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Sắp đến hạn</p>
          </div>
        </div>
      </section>

      {/* Danh mục 4 Môn học (SSG Routes) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Chương trình đào tạo
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Môn Học Kỳ Này
            </h2>
          </div>
        </div>

        <div className="grid-cards">
          {subjects.map((sub) => {
            const count = deadlines.filter((d) => d.subjectSlug === sub.slug).length;
            return (
              <Link
                key={sub.id}
                href={`/subjects/${sub.slug}`}
                className="card card-clickable"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `5px solid ${sub.color}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {sub.code} &bull; {sub.credits} Tín chỉ
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', fontWeight: 600 }}>
                      {count} deadline
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {sub.name}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {sub.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    GV: {sub.instructor}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Xem bài tập <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Deadline sắp đến hạn */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Nhắc nhở quan trọng
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Deadline Gần Nhất Cần Hoàn Thành
            </h2>
          </div>
          <Link href="/deadlines" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Xem tất cả ({deadlines.length})</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cards">
          {upcomingDeadlines.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>
                    {item.subjectName}
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                </span>
                <Link href={`/deadlines/${item.id}`} className="btn btn-outline btn-sm">
                  <span>Xem chi tiết</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

