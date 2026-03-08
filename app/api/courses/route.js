import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });

  const { data } = await supabase.from('courses').select('*')
    .eq('family_id', user.familyId).order('done').order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });

  const { name, qty } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 });

  const { data } = await supabase.from('courses')
    .insert({ family_id: user.familyId, name: name.trim(), qty: qty?.trim() || '1' })
    .select().single();
  return NextResponse.json(data, { status: 201 });
}
