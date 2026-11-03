'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function loginAction(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email');
  const password = formData.get('password');
  const callbackUrl = (formData.get('callbackUrl') as string) || '/dashboard';

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' };
  }

  try {
    await signIn('credentials', {
      email: String(email),
      password: String(password),
      redirectTo: callbackUrl,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Email hoặc mật khẩu không chính xác.' };
        default:
          return { error: 'Đăng nhập thất bại. Vui lòng thử lại.' };
      }
    }
    // Re-throw redirect exceptions from Next.js
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' });
}

