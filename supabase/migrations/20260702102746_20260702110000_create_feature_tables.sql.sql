/*
# Create feature-area tables for AileModu, RamazanOzel, ElifBa, KutubSitte

This is the second migration for the Mübarekçe Pro+ app. It creates 7 new
tables that mirror the localStorage keys used by four feature components that
are not yet backed by Supabase. Like the first migration, the app has no real
Supabase sign-in, so every request runs as the `anon` role and all policies
use `TO anon, authenticated` with open predicates.

1. New Tables

- `family_members` — mirrors `family_members_v5` (AileModu family member list).
  Columns: id, member_key (text, unique — 'me' or Date.now() string),
  name, avatar (emoji), role ('Baba'|'Anne'|'Çocuk'|'Dede'|'Nene'|'Siz'),
  points (int, default 0), created_at.

- `family_goals` — mirrors `family_goals_v5` (AileModu shared family goals).
  Columns: id, goal_key (text, unique — 'hatim'|'sadaka'|'esma'),
  title, target (int), icon, color (tailwind class), unit, updated_at.

- `family_contributions` — mirrors `family_contributions_v5` (per-member
  contribution amounts toward each goal).
  Columns: id, goal_key, member_key, amount (int, default 0),
  updated_at. UNIQUE (goal_key, member_key).

- `ramadan_progress` — mirrors `ramadan_fasting_progress` (RamazanOzel day
  counter, single integer).
  Columns: id, fasting_days (int, default 0), updated_at.

- `ramadan_tasks` — mirrors `ramadan_daily_tasks` (RamazanOzel daily checklist).
  Columns: id, task_key (text, unique), label, icon, completed (bool),
  updated_at.

- `elifba_progress` — mirrors `elifba_progress` (ElifBa completed lesson IDs).
  Columns: id, lesson_id (int, unique), completed_at.

- `hadith_favorites` — mirrors `hadith_favorites` (KutubSitte favorited hadith
  IDs).
  Columns: id, hadith_id (int, unique), created_at.

2. Security
- RLS enabled on every table.
- All policies use `TO anon, authenticated` with open predicates because the
  app has no real sign-in and the data is intentionally shared per-browser.

3. Important Notes
- All tables are single-tenant (no user_id / auth.uid()).
- Idempotent: uses IF NOT EXISTS for tables and DROP POLICY IF EXISTS before
  CREATE POLICY so re-running is safe.
- Indexes added on frequently-queried columns.
*/

-- family_members
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_key text NOT NULL UNIQUE,
  name text NOT NULL,
  avatar text NOT NULL DEFAULT '👤',
  role text NOT NULL DEFAULT 'Siz',
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_family_members" ON family_members;
CREATE POLICY "anon_select_family_members" ON family_members FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_family_members" ON family_members;
CREATE POLICY "anon_insert_family_members" ON family_members FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_family_members" ON family_members;
CREATE POLICY "anon_update_family_members" ON family_members FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_family_members" ON family_members;
CREATE POLICY "anon_delete_family_members" ON family_members FOR DELETE
  TO anon, authenticated USING (true);

-- family_goals
CREATE TABLE IF NOT EXISTS family_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_key text NOT NULL UNIQUE,
  title text NOT NULL,
  target integer NOT NULL DEFAULT 1,
  icon text NOT NULL DEFAULT 'hatim',
  color text NOT NULL DEFAULT 'bg-emerald-500',
  unit text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE family_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_family_goals" ON family_goals;
CREATE POLICY "anon_select_family_goals" ON family_goals FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_family_goals" ON family_goals;
CREATE POLICY "anon_insert_family_goals" ON family_goals FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_family_goals" ON family_goals;
CREATE POLICY "anon_update_family_goals" ON family_goals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_family_goals" ON family_goals;
CREATE POLICY "anon_delete_family_goals" ON family_goals FOR DELETE
  TO anon, authenticated USING (true);

-- family_contributions
CREATE TABLE IF NOT EXISTS family_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_key text NOT NULL,
  member_key text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (goal_key, member_key)
);
ALTER TABLE family_contributions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_family_contributions" ON family_contributions;
CREATE POLICY "anon_select_family_contributions" ON family_contributions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_family_contributions" ON family_contributions;
CREATE POLICY "anon_insert_family_contributions" ON family_contributions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_family_contributions" ON family_contributions;
CREATE POLICY "anon_update_family_contributions" ON family_contributions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_family_contributions" ON family_contributions;
CREATE POLICY "anon_delete_family_contributions" ON family_contributions FOR DELETE
  TO anon, authenticated USING (true);

-- ramadan_progress (single-row counter)
CREATE TABLE IF NOT EXISTS ramadan_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fasting_days integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ramadan_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ramadan_progress" ON ramadan_progress;
CREATE POLICY "anon_select_ramadan_progress" ON ramadan_progress FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ramadan_progress" ON ramadan_progress;
CREATE POLICY "anon_insert_ramadan_progress" ON ramadan_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ramadan_progress" ON ramadan_progress;
CREATE POLICY "anon_update_ramadan_progress" ON ramadan_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ramadan_progress" ON ramadan_progress;
CREATE POLICY "anon_delete_ramadan_progress" ON ramadan_progress FOR DELETE
  TO anon, authenticated USING (true);

-- ramadan_tasks
CREATE TABLE IF NOT EXISTS ramadan_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_key text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text NOT NULL DEFAULT '✨',
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ramadan_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ramadan_tasks" ON ramadan_tasks;
CREATE POLICY "anon_select_ramadan_tasks" ON ramadan_tasks FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ramadan_tasks" ON ramadan_tasks;
CREATE POLICY "anon_insert_ramadan_tasks" ON ramadan_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ramadan_tasks" ON ramadan_tasks;
CREATE POLICY "anon_update_ramadan_tasks" ON ramadan_tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ramadan_tasks" ON ramadan_tasks;
CREATE POLICY "anon_delete_ramadan_tasks" ON ramadan_tasks FOR DELETE
  TO anon, authenticated USING (true);

-- elifba_progress
CREATE TABLE IF NOT EXISTS elifba_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id integer NOT NULL UNIQUE,
  completed_at timestamptz DEFAULT now()
);
ALTER TABLE elifba_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_elifba_progress" ON elifba_progress;
CREATE POLICY "anon_select_elifba_progress" ON elifba_progress FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_elifba_progress" ON elifba_progress;
CREATE POLICY "anon_insert_elifba_progress" ON elifba_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_elifba_progress" ON elifba_progress;
CREATE POLICY "anon_update_elifba_progress" ON elifba_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_elifba_progress" ON elifba_progress;
CREATE POLICY "anon_delete_elifba_progress" ON elifba_progress FOR DELETE
  TO anon, authenticated USING (true);

-- hadith_favorites
CREATE TABLE IF NOT EXISTS hadith_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hadith_id integer NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hadith_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_hadith_favorites" ON hadith_favorites;
CREATE POLICY "anon_select_hadith_favorites" ON hadith_favorites FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_hadith_favorites" ON hadith_favorites;
CREATE POLICY "anon_insert_hadith_favorites" ON hadith_favorites FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_hadith_favorites" ON hadith_favorites;
CREATE POLICY "anon_update_hadith_favorites" ON hadith_favorites FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_hadith_favorites" ON hadith_favorites;
CREATE POLICY "anon_delete_hadith_favorites" ON hadith_favorites FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_family_contributions_goal ON family_contributions (goal_key);
CREATE INDEX IF NOT EXISTS idx_family_contributions_member ON family_contributions (member_key);