'use client';

import React, { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteDeadlineAction } from '@/app/actions/deadline-actions';

interface DeleteDeadlineButtonProps {
  deadlineId: string;
  deadlineTitle: string;
}

export default function DeleteDeadlineButton({
  deadlineId,
  deadlineTitle,
}: DeleteDeadlineButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xoá deadline "${deadlineTitle}" không? Hành động này không thể hoàn tác.`)) {
      startTransition(async () => {
        const res = await deleteDeadlineAction(deadlineId);
        if (res.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="btn btn-sm btn-danger"
      style={{ padding: '0.45rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      title={isPending ? 'Đang xoá...' : 'Xoá deadline'}
      aria-label={`Xoá deadline ${deadlineTitle}`}
    >
      <Trash2 size={14} />
    </button>
  );
}

