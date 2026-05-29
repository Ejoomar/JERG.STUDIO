create table contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  service     text not null,
  message     text not null,
  status      text not null default 'new',
  ip          text,
  created_at  timestamptz not null default now()
);

-- Disable public access: only accessible via service role key
alter table contact_submissions enable row level security;
