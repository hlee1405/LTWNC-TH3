import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserCompletions } from '@/lib/data';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ completions: [] });
  }

  const completions = await getUserCompletions(session.user.id);
  return NextResponse.json({ completions });
}

