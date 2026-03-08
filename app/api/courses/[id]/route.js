import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

const guard = async (req, id) => {
  const auth = requireAuth(req);
  if (auth.error) return auth;
  const { data } = await supabase.from('courses').select('*').eq('id', id).eq('family_id', auth.user.familyId).single();
  if (!data) return { error: 'Introuvable.', status: 404 };
  return { user: auth.user, item: data };
};

export async function PATCH(req, { params }) {
  const r = await guard(req, params.id);
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });

  const body = await req.json();
  const update = body.toggle
    ? { done: !r.item.done }
    : { name: body.name ?? r.item.name, qty: body.qty ?? r.item.qty };

  await supabase.from('courses').update(update).eq('id', params.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const r = await guard(req, params.id);
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  await supabase.from('courses').delete().eq('id', params.id);
  return NextResponse.json({ ok: true });
}
