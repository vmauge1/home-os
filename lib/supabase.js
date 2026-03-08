/**
 * lib/supabase.js — Client Supabase côté serveur (clé service = accès total)
 * Utilisé uniquement dans les API routes Next.js, jamais exposé au navigateur
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;
