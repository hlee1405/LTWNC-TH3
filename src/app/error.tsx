'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lỗi ứng dụng:', error);
  }, [error]);

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
          marginBottom: '1.25rem',
        }}
      >
        <AlertOctagon size={36} />
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
        Đã xảy ra sự cố không mong muốn
      </h1>

      <p style={{ maxWidth: '500px', color: '#64748b', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
        Hệ thống phát hiện lỗi trong quá trình xử lý yêu cầu. Vui lòng nhấn nút thử lại bên dưới hoặc liên hệ ban quản trị.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <RotateCcw size={16} />
          <span>Thử lại</span>
        </button>

        <a href="/" className="btn btn-outline">
          Quay lại Trang chủ
        </a>
      </div>
    </div>
  );
}

