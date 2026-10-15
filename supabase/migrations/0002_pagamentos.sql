-- Mapa Astral — planos, compras avulsas e saldo de análises.
-- Rode no Supabase: SQL Editor → cole este arquivo → Run (depois do 0001).
-- Só o servidor (Edge Functions, com a chave de serviço) grava nestas tabelas;
-- cada pessoa apenas lê os próprios dados.

-- Plano ativo de cada pessoa (Estrela ou Cosmos) e até quando vale.
create table if not exists public.entitlements (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  plan        text check (plan in ('estrela', 'cosmos')),
  plan_until  timestamptz,
  updated_at  timestamptz not null default now()
);

-- Pedidos de pagamento (planos e avulsos). `grants` lista o que a compra libera.
create table if not exists public.purchases (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  product        text not null,
  label          text,
  grants         text[] not null default '{}',
  amount         numeric(10, 2) not null,
  status         text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'refunded')),
  mp_payment_id  text unique,
  expires_at     timestamptz,
  created_at     timestamptz not null default now(),
  paid_at        timestamptz
);

create index if not exists purchases_user_idx on public.purchases (user_id, status);

-- Cada análise completa gerada e qual saldo pagou por ela.
create table if not exists public.analysis_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null,
  access_key  text not null,
  source      text not null check (source in ('grant', 'plan', 'welcome')),
  created_at  timestamptz not null default now()
);

create index if not exists analysis_log_user_idx on public.analysis_log (user_id, created_at);

alter table public.entitlements enable row level security;
alter table public.purchases enable row level security;
alter table public.analysis_log enable row level security;

drop policy if exists "plano: ler o próprio" on public.entitlements;
create policy "plano: ler o próprio" on public.entitlements for select using (user_id = auth.uid());

drop policy if exists "compras: ler as próprias" on public.purchases;
create policy "compras: ler as próprias" on public.purchases for select using (user_id = auth.uid());

drop policy if exists "análises: ler as próprias" on public.analysis_log;
create policy "análises: ler as próprias" on public.analysis_log for select using (user_id = auth.uid());
