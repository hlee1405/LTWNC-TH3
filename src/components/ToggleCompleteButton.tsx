'use client';

import React, { useTransition, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toggleCompleteAction } from '@/app/actions/deadline-actions';

interface ToggleCompleteButtonProps {
  deadlineId: string;
  isCompleted?: boolean;
  isLoggedIn?: boolean;
}

export default function ToggleCompleteButton({
  deadlineId,
  isCompleted: initialCompleted = false,
  isLoggedIn: initialIsLoggedIn = false,
}: ToggleCompleteButtonProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user || initialIsLoggedIn);
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCompleted(initialCompleted);
  }, [initialCompleted]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/user-completions')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.completions)) {
            setCompleted(data.completions.includes(deadlineId));
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.id, deadlineId]);

  const handleToggle = () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập với tài khoản sinh viên để đánh dấu deadline hoàn thành.');
      return;
    }

    // Optimistic UI update
    setCompleted((prev) => !prev);

    startTransition(async () => {
      const res = await toggleCompleteAction(deadlineId);
      if (res.error) {
        // Rollback if error
        setCompleted(initialCompleted);
        alert(res.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`btn btn-sm ${
        completed
          ? 'btn-outline'
          : 'btn-primary'
      }`}
      style={{
        backgroundColor: completed ? '#ecfdf5' : undefined,
        borderColor: completed ? '#10b981' : undefined,
        color: completed ? '#047857' : undefined,
        opacity: isPending ? 0.7 : 1,
      }}
      aria-label={completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
      title={isLoggedIn ? (completed ? 'Bấm để hủy hoàn thành' : 'Bấm để đánh dấu đã hoàn thành') : 'Đăng nhập để đánh dấu'}
    >
      {completed ? (
        <span>Đã hoàn thành</span>
      ) : (
        <span>Đánh dấu xong</span>
      )}
    </button>
  );
}
