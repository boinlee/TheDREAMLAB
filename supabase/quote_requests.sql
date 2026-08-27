create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'website',
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  phone text not null check (char_length(phone) between 1 and 40),
  email text check (email is null or char_length(email) <= 254),
  business_type text,
  message text,
  items jsonb not null default '[]'::jsonb,
  total_amount integer check (total_amount is null or total_amount >= 0),
  consent_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;
revoke all on table public.quote_requests from anon, authenticated;
grant insert on table public.quote_requests to anon;

drop policy if exists "anonymous quote submissions only" on public.quote_requests;
create policy "anonymous quote submissions only"
  on public.quote_requests
  for insert
  to anon
  with check (true);
