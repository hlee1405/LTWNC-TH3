'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogIn, LogOut, LayoutDashboard, ShieldCheck, CalendarCheck } from 'lucide-react';
import type { Role } from '@/types/deadline';

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = (user?.role as Role | undefined) ?? null;

  return (
    <header className="header-wrapper">
      <div className="container header-inner">
        {/* Logo & Tên Cổng Deadline */}
        <Link href="/" className="logo-brand">
          <CalendarCheck size={22} style={{ color: 'var(--primary)' }} />
          <span>Class Deadline Hub</span>
        </Link>

        {/* Menu Điều hướng */}
        <nav>
          <ul className="nav-links">
            <li>
              <Link href="/" className="nav-link">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/deadlines" className="nav-link">
                Deadline công khai
              </Link>
            </li>
            {user && (
              <li>
                <Link href="/dashboard" className="nav-link">
                  Bàn làm việc
                </Link>
              </li>
            )}
            {role === 'admin' && (
              <li>
                <Link href="/admin" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Quản trị
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Khối Xác thực & Người dùng */}
        <div className="auth-panel">
          {status === 'loading' ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {user.name?.replace(/\s*\([^)]*\)/g, '').trim()}
                </span>
                <span className={`badge-role ${role || 'user'}`}>
                  {role === 'admin' ? 'Lớp trưởng' : 'Sinh viên'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-outline btn-sm"
                style={{ gap: '0.3rem' }}
                aria-label="Đăng xuất khỏi hệ thống"
              >
                <LogOut size={14} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link href="/login" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                <LogIn size={15} />
                <span>Đăng nhập</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
