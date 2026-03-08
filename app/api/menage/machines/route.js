import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { data } = await supabase.from('machine_tasks').select('*').eq('family_id', user.familyId).order('done').order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { machine, linge, programme } = await req.json();
  if (!machine || !linge || !programme) return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  const { data } = await supabase.from('machine_tasks').insert({ family_id: user.familyId, machine, linge, programme }).select().single();
  return NextResponse.json(data, { status: 201 });
}
