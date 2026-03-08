import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { data } = await supabase.from('cameras').select('*').eq('family_id', user.familyId).order('name');
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { name, location, app } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 });
  const { data } = await supabase.from('cameras').insert({ family_id: user.familyId, name: name.trim(), location: location || '', app: app || 'yesihome' }).select().single();
  return NextResponse.json(data, { status: 201 });
}
