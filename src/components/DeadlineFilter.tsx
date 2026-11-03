'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Search, Filter, Calendar, BookOpen, FileText, ArrowRight } from 'lucide-react';
import type { Deadline, Subject } from '@/types/deadline';
import CountdownBadge from './CountdownBadge';
import ToggleCompleteButton from './ToggleCompleteButton';

interface DeadlineFilterProps {
  initialDeadlines: Deadline[];
  subjects: Subject[];
  userCompletions?: string[];
  isLoggedIn?: boolean;
}

export default function DeadlineFilter({
  initialDeadlines,
  subjects,
  userCompletions: initialUserCompletions = [],
  isLoggedIn: initialIsLoggedIn = false,
}: DeadlineFilterProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = Boolean(session?.user || initialIsLoggedIn);
  const [userCompletions, setUserCompletions] = useState<string[]>(initialUserCompletions);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/user-completions')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.completions)) {
            setUserCompletions(data.completions);
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.id]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due-asc' | 'due-desc'>('due-asc');

  const filteredDeadlines = useMemo(() => {
    const now = Date.now();

    return initialDeadlines
      .filter((item) => {
        // Filter subject
        if (selectedSubject !== 'all' && item.subjectSlug !== selectedSubject) {
          return false;
        }

        // Filter status
        const isDone = userCompletions.includes(item.id);
        const isOverdue = new Date(item.dueDate).getTime() < now;

        if (statusFilter === 'completed' && !isDone) return false;
        if (statusFilter === 'pending' && isDone) return false;
        if (statusFilter === 'overdue' && (!isOverdue || isDone)) return false;
        if (statusFilter === 'upcoming' && (isOverdue || isDone)) return false;

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchSubject = item.subjectName.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          if (!matchTitle && !matchSubject && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
        return sortBy === 'due-asc' ? timeA - timeB : timeB - timeA;
      });
  }, [initialDeadlines, selectedSubject, statusFilter, search, sortBy, userCompletions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Thanh điều khiển Bộ lọc & Tìm kiếm */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Tìm kiếm */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Tìm theo tên bài, môn học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm deadline"
          />
        </div>

        {/* Lọc Môn học */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            className="form-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Lọc theo môn học"
          >
            <option value="all">Tất cả môn học ({initialDeadlines.length})</option>
            {subjects.map((sub) => (
              <option key={sub.slug} value={sub.slug}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>

        {/* Lọc Trạng thái */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Lọc theo trạng thái"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming">Sắp đến hạn</option>
            <option value="overdue">Đã quá hạn</option>
            {isLoggedIn && <option value="completed">Đã hoàn thành</option>}
            {isLoggedIn && <option value="pending">Chưa hoàn thành</option>}
          </select>
        </div>

        {/* Sắp xếp */}
        <div>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'due-asc' | 'due-desc')}
            aria-label="Sắp xếp thời hạn"
          >
            <option value="due-asc">Hạn gần nhất trước</option>
            <option value="due-desc">Hạn xa nhất trước</option>
          </select>
        </div>
      </div>

      {/* Hiển thị số lượng kết quả */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Hiển thị <strong>{filteredDeadlines.length}</strong> / {initialDeadlines.length} deadline
        </p>
      </div>

      {/* Danh sách Cards */}
      {filteredDeadlines.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}
        >
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Không tìm thấy deadline phù hợp.</p>
          <p style={{ fontSize: '0.875rem' }}>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredDeadlines.map((item) => {
            const isCompleted = userCompletions.includes(item.id);
            return (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        backgroundColor: 'var(--secondary-light)',
                        color: 'var(--secondary)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {item.subjectCode}
                    </span>
                    <CountdownBadge dueDate={item.dueDate} />
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    <Link href={`/deadlines/${item.id}`} style={{ color: 'inherit' }}>
                      {item.title}
                    </Link>
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} />
                      <span>Hạn: <strong>{new Date(item.dueDate).toLocaleString('vi-VN')}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} />
                      <span>Hình thức: {item.format} ({item.weight})</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                    marginTop: '0.5rem',
                  }}
                >
                  <Link
                    href={`/deadlines/${item.id}`}
                    className="btn btn-outline btn-sm"
                    style={{ gap: '0.25rem' }}
                  >
                    <span>Chi tiết</span>
                    <ArrowRight size={14} />
                  </Link>

                  <ToggleCompleteButton
                    deadlineId={item.id}
                    isCompleted={isCompleted}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
