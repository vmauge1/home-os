import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import supabase from '@/lib/supabase';
import { signToken, makeTokenCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, password } = await req.json();
    if (!name || !password) return NextResponse.json({ error: 'Identifiants manquants.' }, { status: 400 });

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .ilike('name', name.trim())
      .limit(1);

    const user = users?.[0];

    // Toujours comparer pour éviter les attaques timing
    const hash = user?.password_hash ?? '$2b$10$invalidhashfortimingprotection00000000000000000000';
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, familyId: user.family_id, name: user.name });
    const res = NextResponse.json({ name: user.name, familyId: user.family_id });
    res.headers.set('Set-Cookie', makeTokenCookie(token));
    return res;
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
