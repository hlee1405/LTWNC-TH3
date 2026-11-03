'use client';

import React, { useState } from 'react';
import { PlusCircle, X, Check, AlertCircle } from 'lucide-react';
import { createDeadlineAction, type ActionState } from '@/app/actions/deadline-actions';
import type { Subject } from '@/types/deadline';

interface AddDeadlineModalProps {
  subjects: Subject[];
}

export default function AddDeadlineModal({ subjects }: AddDeadlineModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<ActionState | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await createDeadlineAction(undefined, formData);
    setIsPending(false);
    setResult(res);

    if (res.success) {
      setTimeout(() => {
        setIsOpen(false);
        setResult(null);
      }, 1200);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
        style={{ gap: '0.4rem' }}
      >
        <PlusCircle size={18} />
        <span>Thêm Deadline mới</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Thêm Hạn Nộp Deadline Mới</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Hạn nộp mới sẽ hiển thị ngay cho toàn bộ sinh viên.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-outline btn-sm"
                aria-label="Đóng modal"
                style={{ borderRadius: '9999px', width: '32px', height: '32px', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {result?.error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-sm)',
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{result.error}</span>
              </div>
            )}

            {result?.success && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#d1fae5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-sm)',
                  color: '#065f46',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                <Check size={16} />
                <span>Thêm deadline thành công! Đang đồng bộ...</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Tiêu đề Deadline / Tên bài tập *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Ví dụ: Báo cáo Thực hành Buổi 8"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subjectSlug">
                  Môn học *
                </label>
                <select id="subjectSlug" name="subjectSlug" required className="form-select">
                  {subjects.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="dueDate">
                    Thời hạn nộp (Due Date) *
                  </label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="datetime-local"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="priority">
                    Mức độ ưu tiên
                  </label>
                  <select id="priority" name="priority" defaultValue="medium" className="form-select">
                    <option value="high">Cao (Gấp / Trọng số lớn)</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">
                    Trọng số điểm
                  </label>
                  <input
                    id="weight"
                    name="weight"
                    type="text"
                    defaultValue="15%"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="format">
                    Hình thức nộp
                  </label>
                  <input
                    id="format"
                    name="format"
                    type="text"
                    defaultValue="GitHub + Báo cáo PDF"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Mô tả chi tiết yêu cầu *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  placeholder="Mô tả các yêu cầu kỹ thuật, cách thức nộp..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-outline"
                  disabled={isPending}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPending}
                >
                  {isPending ? 'Đang tạo...' : 'Tạo Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

