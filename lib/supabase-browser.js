/**
 * lib/supabase-browser.js — Client Supabase côté navigateur (clé publique)
 * Utilisé uniquement pour les abonnements temps réel (lecture des changements)
 */
import { createClient } from '@supabase/supabase-js';

const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabaseBrowser;
