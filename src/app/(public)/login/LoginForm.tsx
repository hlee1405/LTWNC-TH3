'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LogIn, Key, Mail, Shield, User, AlertCircle } from 'lucide-react';

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fillAccount = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
        setLoading(false);
      } else if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối xác thực.');
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tài khoản mẫu tiện dụng (Quick Fill) */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)',
          fontSize: '0.85rem',
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Tài khoản mẫu (Bấm để điền nhanh):
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => fillAccount('admin@ptit.edu.vn', 'admin123')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0.75rem',
              backgroundColor: '#fff',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: '#92400e' }}>Lớp trưởng (Admin): </span>
              <code>admin@ptit.edu.vn</code> | <code>admin123</code>
            </div>
            <span className="badge-role admin">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => fillAccount('sv@ptit.edu.vn', 'sv123456')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0.75rem',
              backgroundColor: '#fff',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: '#065f46' }}>Sinh viên (User): </span>
              <code>sv@ptit.edu.vn</code> | <code>sv123456</code>
            </div>
            <span className="badge-role user">User</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Đăng nhập Credentials */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail
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
              id="email"
              type="email"
              required
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="admin@ptit.edu.vn hoặc sv@ptit.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mật khẩu
          </label>
          <div style={{ position: 'relative' }}>
            <Key
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
              id="password"
              type="password"
              required
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.75rem', fontSize: '1rem' }}
        >
          <LogIn size={18} />
          <span>{loading ? 'Đang xác thực...' : 'Đăng nhập vào Hệ thống'}</span>
        </button>
      </form>

      {/* Đường phân cách */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HOẶC</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
      </div>

      {/* Nút Đăng nhập GitHub OAuth */}
      <button
        type="button"
        onClick={handleGitHubLogin}
        className="btn btn-outline"
        style={{ width: '100%', padding: '0.7rem', gap: '0.5rem', backgroundColor: '#24292e', color: 'white', borderColor: '#24292e' }}
      >
        <GitHubIcon />
        <span>Đăng nhập bằng tài khoản GitHub</span>
      </button>
    </div>
  );
}
