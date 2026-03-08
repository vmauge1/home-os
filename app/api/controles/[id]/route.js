import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const body = await req.json();
  const update = body.check ? { last_check: new Date().toISOString() } : body;
  await supabase.from('controles').update(update).eq('id', params.id).eq('family_id', user.familyId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  await supabase.from('controles').delete().eq('id', params.id).eq('family_id', user.familyId);
  return NextResponse.json({ ok: true });
}
