-- Reader bookmarks for Al-Jāmiʿ al-Kāmil.
-- Recreates the single live table from the Lovable Cloud backend on a
-- standalone Supabase project. Content tables (books, hadiths, chapters,
-- collections) are intentionally absent: the app serves content from the
-- repo's static JSON files, not the database.

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  hadith_number integer not null,
  book_title text,
  collection_title text,
  chapter_title text,
  created_at timestamptz not null default now(),
  unique (user_id, hadith_number)
);

alter table public.bookmarks enable row level security;

create policy "Users read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);
