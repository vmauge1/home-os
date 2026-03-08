import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { data } = await supabase.from('controles').select('*').eq('family_id', user.familyId).order('is_critical', { ascending: false }).order('name');
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { name, icon, freq_days, is_critical } = await req.json();
  if (!name?.trim() || !freq_days) return NextResponse.json({ error: 'Nom et fréquence requis.' }, { status: 400 });
  const { data } = await supabase.from('controles').insert({ family_id: user.familyId, name: name.trim(), icon: icon || '🔧', freq_days: Number(freq_days), is_critical: !!is_critical }).select().single();
  return NextResponse.json(data, { status: 201 });
}
