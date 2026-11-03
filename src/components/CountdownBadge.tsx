'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

interface CountdownBadgeProps {
  dueDate: string;
}

export default function CountdownBadge({ dueDate }: CountdownBadgeProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // cập nhật mỗi phút
    return () => clearInterval(interval);
  }, []);

  const targetTime = new Date(dueDate).getTime();
  const diffMs = targetTime - now;

  // Tránh hydration mismatch bằng cách render placeholder tĩnh cho SSR ban đầu
  if (!mounted) {
    const staticDiff = new Date(dueDate).getTime() - new Date('2026-11-03T12:00:00Z').getTime();
    const days = Math.round(staticDiff / (1000 * 60 * 60 * 24));
    return (
      <span className="badge-countdown safe">
        <Clock size={14} />
        <span>{days >= 0 ? `Còn ${days} ngày` : `Quá hạn ${Math.abs(days)} ngày`}</span>
      </span>
    );
  }

  // Quá hạn
  if (diffMs < 0) {
    const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const overdueHours = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const text = overdueDays > 0 ? `Quá hạn ${overdueDays} ngày` : `Quá hạn ${overdueHours} giờ`;
    return (
      <span className="badge-countdown overdue" title={new Date(dueDate).toLocaleString('vi-VN')}>
        <AlertTriangle size={14} />
        <span>{text}</span>
      </span>
    );
  }

  // Còn hạn
  const remainingDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (remainingDays === 0) {
    return (
      <span className="badge-countdown danger" title={new Date(dueDate).toLocaleString('vi-VN')}>
        <Flame size={14} />
        <span>Hôm nay (còn {remainingHours} giờ)</span>
      </span>
    );
  }

  if (remainingDays <= 3) {
    return (
      <span className="badge-countdown warning" title={new Date(dueDate).toLocaleString('vi-VN')}>
        <Clock size={14} />
        <span>Còn {remainingDays} ngày {remainingHours}h</span>
      </span>
    );
  }

  return (
    <span className="badge-countdown safe" title={new Date(dueDate).toLocaleString('vi-VN')}>
      <CheckCircle size={14} />
      <span>Còn {remainingDays} ngày</span>
    </span>
  );
}

