import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDeadlineById, getDeadlines } from '@/lib/data';
import CountdownBadge from '@/components/CountdownBadge';
import ToggleCompleteButton from '@/components/ToggleCompleteButton';
import JsonLdBreadcrumbs from '@/components/JsonLdBreadcrumbs';
import { ArrowLeft, Calendar, FileText, CheckCircle2, AlertTriangle, BookOpen, Clock, Tag } from 'lucide-react';
import type { Metadata } from 'next';

interface DeadlineDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Route: /deadlines/[id]
 * Chiến lược Render: ISR (Incremental Static Regeneration với On-Demand Revalidation)
 *
 * Lý do chọn ISR On-Demand:
 * 1. Hiệu năng & SEO vượt trội: Mỗi trang chi tiết deadline được pre-render tĩnh thành HTML tĩnh tại build time
 *    (hoặc khi request đầu tiên tới) giúp bot Google lập chỉ mục đầy đủ, xem nguồn trang có ngay nội dung và chia sẻ
 *    mạng xã hội hiển thị OpenGraph Image tức thì.
 * 2. Tính cập nhật theo thời gian thực (Real-time On-demand): Khi lớp trưởng (admin) thêm mới hoặc xóa deadline,
 *    Server Action sẽ gọi revalidatePath('/deadlines/[id]') và revalidatePath('/deadlines'). Cơ chế On-Demand ISR này
 *    buộc Next.js tái tạo lại cache ngay tại thời điểm có biến động dữ liệu, không bắt người dùng phải chờ hết 60s như
 *    ISR thông thường, đồng thời không gây hao phí tài nguyên CPU như SSR (vốn phải render lại ở MỌI request).
 */
export async function generateStaticParams() {
  const deadlines = await getDeadlines();
  return deadlines.map((d) => ({
    id: String(d.id),
  }));
}

export async function generateMetadata({ params }: DeadlineDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const deadline = await getDeadlineById(id);

  if (!deadline) {
    return {
      title: 'Không tìm thấy Deadline',
      description: 'Hạn nộp không tồn tại hoặc đã bị gỡ bỏ.',
    };
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const pageUrl = `${siteUrl}/deadlines/${deadline.id}`;

  return {
    title: `${deadline.title} | ${deadline.subjectName}`,
    description: `Hạn nộp: ${new Date(deadline.dueDate).toLocaleString('vi-VN')}. Môn: ${deadline.subjectName}. Hình thức: ${deadline.format}. ${deadline.description}`,
    openGraph: {
      title: `${deadline.title} - Hạn nộp ${deadline.subjectCode}`,
      description: deadline.description,
      url: pageUrl,
      type: 'article',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title: deadline.title,
      description: deadline.description,
    },
  };
}

export default async function DeadlineDetailPage({ params }: DeadlineDetailPageProps) {
  const { id } = await params;
  const deadline = await getDeadlineById(id);

  if (!deadline) {
    notFound();
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const breadcrumbItems = [
    { name: 'Trang chủ', url: `${siteUrl}` },
    { name: 'Danh sách Deadline', url: `${siteUrl}/deadlines` },
    { name: deadline.subjectName, url: `${siteUrl}/subjects/${deadline.subjectSlug}` },
    { name: deadline.title, url: `${siteUrl}/deadlines/${deadline.id}` },
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Structured Data (JSON-LD BreadcrumbList) phục vụ SEO */}
      <JsonLdBreadcrumbs items={breadcrumbItems} />

      {/* Điều hướng Breadcrumbs trên giao diện */}
      <nav aria-label="Breadcrumb">
        <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', listStyle: 'none', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <li>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>
              Trang chủ
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/deadlines" style={{ color: 'var(--text-muted)' }}>
              Deadlines
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/subjects/${deadline.subjectSlug}`} style={{ color: 'var(--secondary)', fontWeight: 500 }}>
              {deadline.subjectName}
            </Link>
          </li>
          <li>/</li>
          <li style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {deadline.title}
          </li>
        </ol>
      </nav>

      {/* Nút quay lại */}
      <div>
        <Link
          href="/deadlines"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách Deadline</span>
        </Link>
      </div>

      {/* Thẻ Chi tiết Deadline */}
      <article
        className="card"
        style={{
          padding: '2.5rem',
          borderTop: `6px solid ${deadline.priority === 'high' ? 'var(--danger)' : deadline.priority === 'medium' ? 'var(--warning)' : 'var(--secondary)'}`,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header chi tiết */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <Link
                href={`/subjects/${deadline.subjectSlug}`}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  backgroundColor: 'var(--secondary-light)',
                  color: 'var(--secondary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {deadline.subjectCode} - {deadline.subjectName}
              </Link>

              <span className={`badge-priority ${deadline.priority}`}>
                {deadline.priority === 'high' ? 'Ưu tiên cao' : deadline.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
              </span>

              <span
                style={{
                  fontSize: '0.8rem',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  borderRadius: '9999px',
                  fontWeight: 600,
                }}
              >
                Trọng số: {deadline.weight}
              </span>
            </div>

            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.3, color: 'var(--text-primary)' }}>
              {deadline.title}
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            <CountdownBadge dueDate={deadline.dueDate} />
            <ToggleCompleteButton deadlineId={deadline.id} />
          </div>
        </div>

        {/* Thông tin Meta: Thời gian & Hình thức */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <Calendar size={15} />
              <span>Thời hạn chót (Deadline)</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--danger)' }}>
              {new Date(deadline.dueDate).toLocaleString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <Clock size={15} />
              <span>Ngày giao đề</span>
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {new Date(deadline.assignedDate).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <FileText size={15} />
              <span>Hình thức nộp</span>
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {deadline.format}
            </p>
          </div>
        </div>

        {/* Nội dung Mô tả chi tiết yêu cầu */}
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Nội dung và Yêu cầu nộp bài
          </h2>
          <div
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-line',
              padding: '1rem 0',
            }}
          >
            {deadline.description}
          </div>
        </div>
      </article>
    </div>
  );
}
