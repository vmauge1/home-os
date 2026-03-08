import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const body = await req.json();
  await supabase.from('repas').update(body).eq('id', params.id).eq('family_id', user.familyId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  await supabase.from('repas').delete().eq('id', params.id).eq('family_id', user.familyId);
  return NextResponse.json({ ok: true });
}
