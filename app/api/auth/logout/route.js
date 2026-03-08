import { NextResponse } from 'next/server';
import { makeTokenCookie } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', makeTokenCookie(null, true));
  return res;
}
