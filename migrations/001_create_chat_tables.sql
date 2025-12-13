-- migrations/001_create_chat_tables.sql
-- Purpose: Store voice chat sessions (groups) and messages without login.

begin;

-- UUID helpers (Supabase commonly has pgcrypto available)
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Ensure public schema is used
set search_path = public;

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Chat sessions (chat groups)
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  title varchar(255),
  first_user_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_sessions_created_at_idx
  on public.chat_sessions (created_at desc);

drop trigger if exists set_updated_at_chat_sessions on public.chat_sessions;
create trigger set_updated_at_chat_sessions
before update on public.chat_sessions
for each row
execute function public.set_updated_at();

-- Messages belonging to a session
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  speaker varchar(50) not null,
  message text not null,
  "timestamp" timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chat_messages_speaker_check
    check (speaker in ('나', 'AI 선생님', '시스템'))
);

create index if not exists chat_messages_session_id_idx
  on public.chat_messages (session_id);

create index if not exists chat_messages_timestamp_idx
  on public.chat_messages ("timestamp");

create index if not exists chat_messages_session_timestamp_idx
  on public.chat_messages (session_id, "timestamp");

commit;


