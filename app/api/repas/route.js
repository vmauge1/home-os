import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { data } = await supabase.from('repas').select('*').eq('family_id', user.familyId).order('is_favorite', { ascending: false }).order('name');
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { name, category, notes, is_favorite } = await req.json();
  if (!name?.trim() || !category?.trim()) return NextResponse.json({ error: 'Nom et catégorie requis.' }, { status: 400 });
  const { data } = await supabase.from('repas').insert({ family_id: user.familyId, name: name.trim(), category: category.trim(), notes: notes || '', is_favorite: !!is_favorite }).select().single();
  return NextResponse.json(data, { status: 201 });
}
