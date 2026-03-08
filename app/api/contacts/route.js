import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { data } = await supabase.from('contacts').select('*').eq('family_id', user.familyId).order('is_favorite', { ascending: false }).order('category').order('name');
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  const { user, error, status } = requireAuth(req);
  if (error) return NextResponse.json({ error }, { status });
  const { name, phone, category, note, is_favorite } = await req.json();
  if (!name?.trim() || !phone?.trim() || !category?.trim()) return NextResponse.json({ error: 'Nom, téléphone et catégorie requis.' }, { status: 400 });
  const { data } = await supabase.from('contacts').insert({ family_id: user.familyId, name: name.trim(), phone: phone.trim(), category: category.trim(), note: note || '', is_favorite: !!is_favorite }).select().single();
  return NextResponse.json(data, { status: 201 });
}
