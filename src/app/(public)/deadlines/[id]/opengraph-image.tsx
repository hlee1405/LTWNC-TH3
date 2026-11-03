import { ImageResponse } from 'next/og';
import { getDeadlineById } from '@/lib/data';

export const runtime = 'nodejs';
export const alt = 'Class Deadline Hub - Chi tiết hạn nộp';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deadline = await getDeadlineById(id);

  const title = deadline?.title || 'Chi tiết Deadline Lớp học';
  const subject = deadline?.subjectName || 'Học viện Công nghệ Bưu chính Viễn thông';
  const subjectCode = deadline?.subjectCode || 'PTIT';
  const dueDate = deadline?.dueDate
    ? new Date(deadline.dueDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
  const weight = deadline?.weight || '15%';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          color: 'white',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#c0262d',
                color: 'white',
                fontWeight: 900,
                fontSize: 28,
                padding: '8px 18px',
                borderRadius: 8,
                letterSpacing: 2,
              }}
            >
              PTIT
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#94a3b8' }}>
              Class Deadline Hub
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              border: '2px solid #334155',
              padding: '8px 20px',
              borderRadius: 30,
              fontSize: 22,
              color: '#38bdf8',
              fontWeight: 700,
            }}
          >
            {subjectCode} &bull; {weight}
          </div>
        </div>

        {/* Middle Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: 28, color: '#f59e0b', fontWeight: 700 }}>
            {subject}
          </div>
          <div
            style={{
              fontSize: 50,
              fontWeight: 900,
              lineHeight: 1.2,
              color: '#ffffff',
              maxWidth: '1040px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #334155',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: 24, color: '#94a3b8' }}>Hạn nộp chính thức:</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f43f5e' }}>
              {dueDate}
            </div>
          </div>

          <div style={{ fontSize: 22, color: '#64748b' }}>
            Học kỳ 1 &bull; Năm học 2026-2027
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

