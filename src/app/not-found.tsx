import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '3rem 1rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563eb',
          marginBottom: '1.25rem',
        }}
      >
        <FileQuestion size={40} />
      </div>

      <span
        style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#2563eb',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '0.25rem',
        }}
      >
        Lỗi 404 - Không tìm thấy nội dung
      </span>

      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>
        Trang hoặc Deadline không tồn tại
      </h1>

      <p style={{ maxWidth: '520px', color: '#64748b', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
        Đường dẫn bạn vừa truy cập không tồn tại trên hệ thống Class Deadline Hub hoặc deadline này đã được ban quản trị gỡ bỏ.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/deadlines" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          <span>Xem tất cả Deadline</span>
        </Link>
        <Link href="/" className="btn btn-outline" style={{ gap: '0.5rem' }}>
          <Home size={16} />
          <span>Về Trang chủ</span>
        </Link>
      </div>
    </div>
  );
}

