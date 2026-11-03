import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '403 Forbidden | Truy Cập Bị Từ Chối',
  description: 'Bạn không có quyền quản trị viên để truy cập khu vực này.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForbiddenPage() {
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
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
          marginBottom: '1.25rem',
        }}
      >
        <ShieldAlert size={44} />
      </div>

      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 800,
          color: '#dc2626',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '0.25rem',
        }}
      >
        Lỗi 403 - Quyền Truy Cập Bị Từ Chối
      </span>

      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0f172a' }}>
        Khu Vực Dành Riêng Cho Lớp Trưởng
      </h1>

      <p style={{ maxWidth: '540px', color: '#64748b', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
        Tài khoản của bạn không có quyền truy cập khu vực này. Chỉ tài khoản <strong>Lớp trưởng (Admin)</strong> mới có quyền quản trị deadline.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/dashboard" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <LayoutDashboard size={16} />
          <span>Về Bàn làm việc của tôi</span>
        </Link>
        <Link href="/" className="btn btn-outline" style={{ gap: '0.5rem' }}>
          <Home size={16} />
          <span>Về Trang chủ</span>
        </Link>
      </div>
    </div>
  );
}

