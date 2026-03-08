-- schema.sql — À coller dans Supabase > SQL Editor > New Query > Run

-- Utilisateurs (créés via script CLI, jamais via l'appli)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  family_id text not null default 'family1',
  created_at timestamptz default now()
);

-- Courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  family_id text not null,
  name text not null,
  qty text default '1',
  done boolean default false,
  created_at timestamptz default now()
);

-- Tâches ménage
create table if not exists menage_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id text not null,
  name text not null,
  done boolean default false,
  done_at timestamptz,
  created_at timestamptz default now()
);

-- Machines (lave-linge / sèche-linge)
create table if not exists machine_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id text not null,
  machine text not null,
  linge text not null,
  programme text not null,
  done boolean default false,
  done_at timestamptz,
  created_at timestamptz default now()
);

-- Contrôles maintenance
create table if not exists controles (
  id uuid primary key default gen_random_uuid(),
  family_id text not null,
  name text not null,
  icon text default '🔧',
  freq_days integer not null,
  last_check timestamptz,
  is_critical boolean default false
);

-- Recettes
create table if not exists repas (
  id uuid primary key default gen_random_uuid(),
  family_id text not null,
  name text not null,
  category text not null,
  notes text default '',
  is_favorite boolean default false
);

-- Caméras
create table if not exists cameras (
  id uuid primary key default gen_random_uuid(),
  family_id text not null,
  name text not null,
  location text default '',
  app text default 'yesihome'
);

-- Contacts urgence
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  family_id text not null,
  name text not null,
  phone text not null,
  category text not null,
  note text default '',
  is_favorite boolean default false
);

-- Activer le temps réel sur toutes les tables (dans Supabase : Database > Replication)
-- Ou exécuter :
alter publication supabase_realtime add table courses;
alter publication supabase_realtime add table menage_tasks;
alter publication supabase_realtime add table machine_tasks;
alter publication supabase_realtime add table controles;
alter publication supabase_realtime add table repas;
alter publication supabase_realtime add table cameras;
alter publication supabase_realtime add table contacts;

-- Données par défaut : contrôles maintenance
insert into controles (family_id, name, icon, freq_days, is_critical) values
  ('family1', 'Filtre climatisation', '❄️', 90, false),
  ('family1', 'Détecteur de fumée', '🔥', 365, true),
  ('family1', 'Extincteur', '🧯', 365, true),
  ('family1', 'Chaudière', '🔧', 365, true),
  ('family1', 'Nettoyage VMC', '💨', 180, false);

-- Caméras exemple
insert into cameras (family_id, name, location, app) values
  ('family1', 'Entrée', 'Porte d''entrée', 'yesihome'),
  ('family1', 'Jardin', 'Terrasse', 'yesihome');
