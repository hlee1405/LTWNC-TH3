import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSubjects, getSubjectBySlug, getDeadlinesBySubject } from '@/lib/data';
import CountdownBadge from '@/components/CountdownBadge';
import { ArrowLeft, BookOpen, User, Calendar, FileText, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

interface SubjectPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Route: /subjects/[slug]
 * Chiến lược Render: SSG (Static Site Generation với generateStaticParams)
 * Lý do chọn SSG: Danh sách các môn học trong kỳ là cố định (4 môn học), hiếm khi thay đổi.
 * Việc tạo sẵn toàn bộ các trang môn học dưới dạng HTML tĩnh ngay từ khâu build (npm run build)
 * giúp giảm tải 100% việc tính toán tại server Node.js khi có sinh viên truy cập, đem lại tốc độ
 * phản hồi nhanh nhất và tối ưu cho công cụ tìm kiếm cào dữ liệu (SEO Crawler).
 */
export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((sub) => ({
    slug: sub.slug,
  }));
}

export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);

  if (!subject) {
    return {
      title: 'Môn học không tồn tại',
    };
  }

  return {
    title: `${subject.name} (${subject.code}) | Môn học`,
    description: subject.description,
    openGraph: {
      title: `${subject.name} - Thông tin môn học & Deadline`,
      description: subject.description,
    },
  };
}

export default async function SubjectDetailPage({ params }: SubjectPageProps) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);

  if (!subject) {
    notFound();
  }

  const subjectDeadlines = await getDeadlinesBySubject(slug);

  return (
    <div className="container" style={{ paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Nút quay lại & Breadcrumb */}
      <div>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Trang chủ</span>
        </Link>
      </div>

      {/* Header Môn học */}
      <section
        className="card"
        style={{
          borderLeft: `6px solid ${subject.color}`,
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              backgroundColor: 'var(--secondary-light)',
              color: 'var(--secondary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {subject.code}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            &bull; {subject.credits} Tín chỉ
          </span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {subject.name}
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '800px' }}>
          {subject.description}
        </p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={16} style={{ color: 'var(--primary)' }} />
            <span>Giảng viên: <strong>{subject.instructor}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} style={{ color: 'var(--secondary)' }} />
            <span>Tổng số deadline: <strong>{subjectDeadlines.length} bài tập</strong></span>
          </div>
        </div>
      </section>

      {/* Danh sách các Deadline của môn */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          Danh sách Deadline môn {subject.name}
        </h2>

        {subjectDeadlines.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            Hiện chưa có deadline nào được giao cho môn học này.
          </div>
        ) : (
          <div className="grid-cards">
            {subjectDeadlines.map((item) => (
              <div
                key={item.id}
                className="card card-clickable"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${item.priority === 'high' ? 'var(--danger)' : item.priority === 'medium' ? 'var(--warning)' : 'var(--secondary)'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className={`badge-priority ${item.priority}`}>
                      {item.priority === 'high' ? 'Ưu tiên cao' : item.priority === 'medium' ? 'Ưu tiên TB' : 'Thấp'}
                    </span>
                    <CountdownBadge dueDate={item.dueDate} />
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Link href={`/deadlines/${item.id}`} style={{ color: 'inherit' }}>
                      {item.title}
                    </Link>
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} />
                      <span>Hạn: {new Date(item.dueDate).toLocaleString('vi-VN')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} />
                      <span>{item.format} ({item.weight})</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', marginTop: '0.75rem' }}>
                  <Link href={`/deadlines/${item.id}`} className="btn btn-primary btn-sm" style={{ gap: '0.25rem' }}>
                    <span>Xem chi tiết</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

