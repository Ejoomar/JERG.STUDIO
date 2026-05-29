create table contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  service     text not null,
  message     text not null,
  status      text not null default 'new'
                check (status in ('new', 'read', 'replied')),
  ip          varchar(45), -- rate-limit fingerprint only; consider anonymizing to /24 prefix for GDPR compliance
  created_at  timestamptz not null default now()
);

-- RLS is enabled with no public policies.
-- anon and authenticated roles have zero access to this table.
-- The API route authenticates with SUPABASE_SERVICE_ROLE_KEY, which is a Postgres
-- superuser role that bypasses RLS — so inserts from the server-side route work correctly.
alter table contact_submissions enable row level security;
