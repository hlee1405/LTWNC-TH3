'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, CalendarCheck, Home, BookOpen, Clock } from 'lucide-react';
import type { Role } from '@/types/deadline';

interface DashboardSidebarProps {
  userRole?: Role;
  userName?: string;
  userEmail?: string;
}

export default function DashboardSidebar({ userRole, userName, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Bàn làm việc của tôi',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'Tất cả Deadline lớp',
      href: '/deadlines',
      icon: CalendarCheck,
      active: pathname.startsWith('/deadlines'),
    },
    ...(userRole === 'admin'
      ? [
          {
            label: 'Quản trị (Lớp trưởng)',
            href: '/admin',
            icon: ShieldCheck,
            active: pathname.startsWith('/admin'),
            badge: 'Admin',
          },
        ]
      : []),
    {
      label: 'Trang chủ môn học',
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
  ];

  return (
    <aside className="sidebar">
      {/* Thông tin hồ sơ */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className={`badge-role ${userRole || 'user'}`}>
            {userRole === 'admin' ? 'Lớp trưởng' : 'Sinh viên'}
          </span>
        </div>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {userName || 'Người dùng'}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{userEmail}</p>
      </div>

      {/* Menu Sidebar */}
      <div>
        <p
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
            fontWeight: 700,
            marginBottom: '0.75rem',
            paddingLeft: '0.5rem',
          }}
        >
          Điều hướng
        </p>
        <ul className="sidebar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.href}
                className={`sidebar-item ${item.active ? 'active' : ''}`}
              >
                <Link href={item.href}>
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.4rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '9999px',
                        fontWeight: 700,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Thông tin hỗ trợ */}
      <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          Class Deadline Hub
        </p>
        <p>Học kỳ 1 - Năm học 2026-2027</p>
      </div>
    </aside>
  );
}

