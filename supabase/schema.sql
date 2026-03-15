-- ─────────────────────────────────────────────────────────────────────────────
-- Mixtape — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────


-- ── mixtapes ─────────────────────────────────────────────────────────────────

create table if not exists mixtapes (
  id               uuid primary key default gen_random_uuid(),
  user_id          text        not null,
  recipient_name   text        not null,
  emotional_brief  text        not null,
  liner_note       text,
  cover_image_url  text,
  cover_prompt     text,
  spotify_playlist_url text,
  share_slug       text        not null unique,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Index for share page lookups (public, by slug)
create index if not exists mixtapes_share_slug_idx on mixtapes (share_slug);

-- Index for fetching a user's own mixtapes
create index if not exists mixtapes_user_id_idx on mixtapes (user_id);


-- ── tracks ───────────────────────────────────────────────────────────────────

create table if not exists tracks (
  id           uuid primary key default gen_random_uuid(),
  mixtape_id   uuid        not null references mixtapes (id) on delete cascade,
  spotify_id   text        not null,
  title        text        not null,
  artist       text        not null,
  album_art    text,
  preview_url  text,
  duration_ms  integer     not null,
  reason       text,
  note         text,
  side         text        not null check (side in ('A', 'B')),
  position     integer     not null,
  source       text        not null check (source in ('library', 'discovery', 'classic'))
);

-- Index for fetching a mixtape's tracks (used in every select)
create index if not exists tracks_mixtape_id_idx on tracks (mixtape_id);


-- ── Row-level security ───────────────────────────────────────────────────────
-- Our server routes always use the service role key, which bypasses RLS.
-- RLS is configured here to prevent accidental direct client access.

alter table mixtapes enable row level security;
alter table tracks    enable row level security;

-- Anyone can read a mixtape by its share slug (for the public share page)
create policy "Public read by share slug"
  on mixtapes for select
  using (true);

-- Anyone can read tracks that belong to a readable mixtape
create policy "Public read tracks"
  on tracks for select
  using (true);

-- All writes go through the server (service role), so no client insert/update
-- policies are needed. If you ever want direct client writes, add them here.
