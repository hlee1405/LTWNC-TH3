import React from 'react';
import { getDeadlines, getSubjects } from '@/lib/data';
import DeadlineFilter from '@/components/DeadlineFilter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Danh sách Deadline | Class Deadline Hub',
  description: 'Toàn bộ danh sách hạn nộp bài tập và đồ án các môn học trong kỳ.',
};

/**
 * Route: /deadlines
 * Chiến lược Render: ISR (Incremental Static Regeneration), làm mới sau 60 giây
 * Cấu hình: export const revalidate = 60;
 * Lý do chọn ISR: Trang danh sách deadline được nhiều người dùng và khách truy cập liên tục.
 * Sử dụng ISR giúp trang được phục vụ như trang tĩnh (Static) từ CDN Cache, đem lại tốc độ cực nhanh.
 * Sau chu kỳ 60 giây, nếu có request mới, Next.js sẽ âm thầm revalidate lại dữ liệu ở chế độ nền (stale-while-revalidate),
 * đảm bảo dữ liệu luôn mới mà máy chủ không phải render lại cho từng lượt truy cập đơn lẻ.
 */
export const revalidate = 60;

export default async function DeadlinesPage() {
  const [deadlines, subjects] = await Promise.all([
    getDeadlines(),
    getSubjects(),
  ]);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Tiêu đề & Thông tin */}
      <div>
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tổng số: <strong>{deadlines.length}</strong> bài tập cần nộp
          </span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Tất Cả Deadline Lớp Học
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '750px' }}>
          Theo dõi và lọc danh sách hạn nộp theo môn học và trạng thái.
        </p>
      </div>

      {/* Component Tương tác Lọc (Client Component) */}
      <DeadlineFilter
        initialDeadlines={deadlines}
        subjects={subjects}
      />
    </div>
  );
}
