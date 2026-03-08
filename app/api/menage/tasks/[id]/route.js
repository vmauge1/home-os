import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { data: task } = await supabase.from('menage_tasks').select('*').eq('id', params.id).eq('family_id', user.familyId).single();
  if (!task) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 });
  await supabase.from('menage_tasks').update({ done: !task.done, done_at: !task.done ? new Date().toISOString() : null }).eq('id', params.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  await supabase.from('menage_tasks').delete().eq('id', params.id).eq('family_id', user.familyId);
  return NextResponse.json({ ok: true });
}
