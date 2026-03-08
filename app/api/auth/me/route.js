import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  return NextResponse.json({ name: user.name, familyId: user.familyId });
}
