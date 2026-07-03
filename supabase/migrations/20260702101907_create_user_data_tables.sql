/*
# Create persistent user data tables (single-tenant, no real auth)

The Mübarekçe Pro+ app currently uses localStorage-based "auth" — there is no
real Supabase sign-in, so every request runs as the `anon` role. This migration
creates tables that mirror the most important localStorage keys so user data
can persist across devices/browsers. All tables are single-tenant: data is
intentionally shared/public within the anon-key client, so policies use
`TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`.

1. New Tables
- `user_profiles` — mirrors `user_session` + `theme` + `is_premium_user`.
  Columns: id, name, email, avatar, theme (light/dark), is_premium, premium_until, updated_at.
- `zikir_counts` — mirrors `serbest_count` (free-form dhikr counter).
  Columns: id, count, updated_at.
- `zikir_items` — mirrors `user_zikirler` (custom dhikr list with counts/targets).
  Columns: id, name, count, target, created_at.
- `zikir_history` — mirrors `zikir_history` (completed/incomplete dhikr log).
  Columns: id, name, count, target, status, date_str, time_str, created_at.
- `prayer_logs` — mirrors `prayers_<date>` (daily prayer status tracking).
  Columns: id, date_key, prayer_name, status, updated_at.
- `habit_logs` — mirrors `habits_<date>` (daily habit completion).
  Columns: id, date_key, habit_id, completed, updated_at.
- `custom_habits` — mirrors `user_custom_habits` (user-defined habits).
  Columns: id, habit_id, label, icon, category, created_at.
- `kaza_namaz` — mirrors `kaza_namaz` (makeup prayer debt counts).
  Columns: id, fajr, dhuhr, asr, maghrib, isha, witr, updated_at.
- `kaza_oruc` — mirrors `kaza_oruc` (makeup fasting debt counts).
  Columns: id, ramadan, kaffarah, updated_at.
- `worship_logs` — mirrors `worship_logs` (ibadet history entries).
  Columns: id, log_type, label, detail, timestamp, date_str, time_str, created_at.
- `quran_progress` — mirrors `quran_progress` + `quran_last_read`.
  Columns: id, surah_number, last_ayah, progress_ayah, updated_at.
- `user_settings` — mirrors notification/sound/mode preferences.
  Columns: id, key, value, updated_at. (single-row key/value store)

2. Security
- RLS enabled on every table.
- All policies use `TO anon, authenticated` with open predicates because the
  app has no real sign-in and the data is intentionally shared per-browser.
*/

-- user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Misafir',
  email text,
  avatar text,
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  is_premium boolean NOT NULL DEFAULT false,
  premium_until timestamptz,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_user_profiles" ON user_profiles;
CREATE POLICY "anon_select_user_profiles" ON user_profiles FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_user_profiles" ON user_profiles;
CREATE POLICY "anon_insert_user_profiles" ON user_profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_user_profiles" ON user_profiles;
CREATE POLICY "anon_update_user_profiles" ON user_profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_user_profiles" ON user_profiles;
CREATE POLICY "anon_delete_user_profiles" ON user_profiles FOR DELETE
  TO anon, authenticated USING (true);

-- zikir_counts (serbest zikir)
CREATE TABLE IF NOT EXISTS zikir_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE zikir_counts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_zikir_counts" ON zikir_counts;
CREATE POLICY "anon_select_zikir_counts" ON zikir_counts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_zikir_counts" ON zikir_counts;
CREATE POLICY "anon_insert_zikir_counts" ON zikir_counts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_zikir_counts" ON zikir_counts;
CREATE POLICY "anon_update_zikir_counts" ON zikir_counts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_zikir_counts" ON zikir_counts;
CREATE POLICY "anon_delete_zikir_counts" ON zikir_counts FOR DELETE
  TO anon, authenticated USING (true);

-- zikir_items (user_zikirler)
CREATE TABLE IF NOT EXISTS zikir_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  target integer NOT NULL DEFAULT 33,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE zikir_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_zikir_items" ON zikir_items;
CREATE POLICY "anon_select_zikir_items" ON zikir_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_zikir_items" ON zikir_items;
CREATE POLICY "anon_insert_zikir_items" ON zikir_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_zikir_items" ON zikir_items;
CREATE POLICY "anon_update_zikir_items" ON zikir_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_zikir_items" ON zikir_items;
CREATE POLICY "anon_delete_zikir_items" ON zikir_items FOR DELETE
  TO anon, authenticated USING (true);

-- zikir_history
CREATE TABLE IF NOT EXISTS zikir_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  target integer NOT NULL DEFAULT 33,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'incomplete')),
  date_str text,
  time_str text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE zikir_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_zikir_history" ON zikir_history;
CREATE POLICY "anon_select_zikir_history" ON zikir_history FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_zikir_history" ON zikir_history;
CREATE POLICY "anon_insert_zikir_history" ON zikir_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_zikir_history" ON zikir_history;
CREATE POLICY "anon_update_zikir_history" ON zikir_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_zikir_history" ON zikir_history;
CREATE POLICY "anon_delete_zikir_history" ON zikir_history FOR DELETE
  TO anon, authenticated USING (true);

-- prayer_logs (prayers_<date>)
CREATE TABLE IF NOT EXISTS prayer_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text NOT NULL,
  prayer_name text NOT NULL,
  status text NOT NULL DEFAULT 'not_yet' CHECK (status IN ('not_yet', 'done', 'congregation', 'late', 'missed')),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (date_key, prayer_name)
);
ALTER TABLE prayer_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_prayer_logs" ON prayer_logs;
CREATE POLICY "anon_select_prayer_logs" ON prayer_logs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_prayer_logs" ON prayer_logs;
CREATE POLICY "anon_insert_prayer_logs" ON prayer_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_prayer_logs" ON prayer_logs;
CREATE POLICY "anon_update_prayer_logs" ON prayer_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_prayer_logs" ON prayer_logs;
CREATE POLICY "anon_delete_prayer_logs" ON prayer_logs FOR DELETE
  TO anon, authenticated USING (true);

-- habit_logs (habits_<date>)
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text NOT NULL,
  habit_id text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (date_key, habit_id)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_habit_logs" ON habit_logs;
CREATE POLICY "anon_select_habit_logs" ON habit_logs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_habit_logs" ON habit_logs;
CREATE POLICY "anon_insert_habit_logs" ON habit_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_habit_logs" ON habit_logs;
CREATE POLICY "anon_update_habit_logs" ON habit_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_habit_logs" ON habit_logs;
CREATE POLICY "anon_delete_habit_logs" ON habit_logs FOR DELETE
  TO anon, authenticated USING (true);

-- custom_habits (user_custom_habits)
CREATE TABLE IF NOT EXISTS custom_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text NOT NULL DEFAULT '✨',
  category text NOT NULL DEFAULT 'ihsan' CHECK (category IN ('ilm', 'ihsan', 'zikir', 'sosyal')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE custom_habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_custom_habits" ON custom_habits;
CREATE POLICY "anon_select_custom_habits" ON custom_habits FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_custom_habits" ON custom_habits;
CREATE POLICY "anon_insert_custom_habits" ON custom_habits FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_custom_habits" ON custom_habits;
CREATE POLICY "anon_update_custom_habits" ON custom_habits FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_custom_habits" ON custom_habits;
CREATE POLICY "anon_delete_custom_habits" ON custom_habits FOR DELETE
  TO anon, authenticated USING (true);

-- kaza_namaz
CREATE TABLE IF NOT EXISTS kaza_namaz (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fajr integer NOT NULL DEFAULT 0,
  dhuhr integer NOT NULL DEFAULT 0,
  asr integer NOT NULL DEFAULT 0,
  maghrib integer NOT NULL DEFAULT 0,
  isha integer NOT NULL DEFAULT 0,
  witr integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE kaza_namaz ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_kaza_namaz" ON kaza_namaz;
CREATE POLICY "anon_select_kaza_namaz" ON kaza_namaz FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_kaza_namaz" ON kaza_namaz;
CREATE POLICY "anon_insert_kaza_namaz" ON kaza_namaz FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_kaza_namaz" ON kaza_namaz;
CREATE POLICY "anon_update_kaza_namaz" ON kaza_namaz FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_kaza_namaz" ON kaza_namaz;
CREATE POLICY "anon_delete_kaza_namaz" ON kaza_namaz FOR DELETE
  TO anon, authenticated USING (true);

-- kaza_oruc
CREATE TABLE IF NOT EXISTS kaza_oruc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ramadan integer NOT NULL DEFAULT 0,
  kaffarah integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE kaza_oruc ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_kaza_oruc" ON kaza_oruc;
CREATE POLICY "anon_select_kaza_oruc" ON kaza_oruc FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_kaza_oruc" ON kaza_oruc;
CREATE POLICY "anon_insert_kaza_oruc" ON kaza_oruc FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_kaza_oruc" ON kaza_oruc;
CREATE POLICY "anon_update_kaza_oruc" ON kaza_oruc FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_kaza_oruc" ON kaza_oruc;
CREATE POLICY "anon_delete_kaza_oruc" ON kaza_oruc FOR DELETE
  TO anon, authenticated USING (true);

-- worship_logs
CREATE TABLE IF NOT EXISTS worship_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type text NOT NULL CHECK (log_type IN ('prayer', 'habit')),
  label text NOT NULL,
  detail text,
  log_timestamp bigint,
  date_str text,
  time_str text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE worship_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_worship_logs" ON worship_logs;
CREATE POLICY "anon_select_worship_logs" ON worship_logs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_worship_logs" ON worship_logs;
CREATE POLICY "anon_insert_worship_logs" ON worship_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_worship_logs" ON worship_logs;
CREATE POLICY "anon_update_worship_logs" ON worship_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_worship_logs" ON worship_logs;
CREATE POLICY "anon_delete_worship_logs" ON worship_logs FOR DELETE
  TO anon, authenticated USING (true);

-- quran_progress (quran_progress + quran_last_read)
CREATE TABLE IF NOT EXISTS quran_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surah_number integer NOT NULL UNIQUE,
  last_ayah integer NOT NULL DEFAULT 0,
  progress_ayah integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE quran_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_quran_progress" ON quran_progress;
CREATE POLICY "anon_select_quran_progress" ON quran_progress FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quran_progress" ON quran_progress;
CREATE POLICY "anon_insert_quran_progress" ON quran_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_quran_progress" ON quran_progress;
CREATE POLICY "anon_update_quran_progress" ON quran_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quran_progress" ON quran_progress;
CREATE POLICY "anon_delete_quran_progress" ON quran_progress FOR DELETE
  TO anon, authenticated USING (true);

-- user_settings (key/value store for prefs)
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_user_settings" ON user_settings;
CREATE POLICY "anon_select_user_settings" ON user_settings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_user_settings" ON user_settings;
CREATE POLICY "anon_insert_user_settings" ON user_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_user_settings" ON user_settings;
CREATE POLICY "anon_update_user_settings" ON user_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_user_settings" ON user_settings;
CREATE POLICY "anon_delete_user_settings" ON user_settings FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for frequently-queried columns
CREATE INDEX IF NOT EXISTS idx_prayer_logs_date ON prayer_logs (date_key);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs (date_key);
CREATE INDEX IF NOT EXISTS idx_worship_logs_created ON worship_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zikir_history_created ON zikir_history (created_at DESC);
