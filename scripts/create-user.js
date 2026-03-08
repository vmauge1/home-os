/**
 * scripts/create-user.js — Crée un compte familial dans Supabase
 * Usage : node scripts/create-user.js --name "Marie" --password "motdepasse"
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const args = process.argv.slice(2);
const get = flag => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const name = get('--name');
const password = get('--password');
const familyId = get('--family') || 'family1';

if (!name || !password) {
  console.error('Usage : node scripts/create-user.js --name "Prénom" --password "motdepasse"');
  process.exit(1);
}

(async () => {
  const { data: existing } = await supabase.from('users').select('id').ilike('name', name).limit(1);
  if (existing?.length > 0) { console.error(`❌ "${name}" existe déjà.`); process.exit(1); }

  const hash = await bcrypt.hash(password, 12);
  const { error } = await supabase.from('users').insert({ name, password_hash: hash, family_id: familyId });
  if (error) { console.error('❌ Erreur :', error.message); process.exit(1); }

  console.log(`✅ Utilisateur "${name}" créé (famille: ${familyId})`);
  process.exit(0);
})();
