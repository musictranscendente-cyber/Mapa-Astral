-- Mapa Astral — contas e mapas sincronizados.
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.

-- Mapas (dados de nascimento) de cada usuário.
create table if not exists public.birth_profiles (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists birth_profiles_user_idx on public.birth_profiles (user_id);

-- Cada pessoa só enxerga e altera os próprios mapas.
alter table public.birth_profiles enable row level security;

drop policy if exists "mapas: ler os próprios" on public.birth_profiles;
create policy "mapas: ler os próprios" on public.birth_profiles
  for select using (user_id = auth.uid());

drop policy if exists "mapas: criar os próprios" on public.birth_profiles;
create policy "mapas: criar os próprios" on public.birth_profiles
  for insert with check (user_id = auth.uid());

drop policy if exists "mapas: alterar os próprios" on public.birth_profiles;
create policy "mapas: alterar os próprios" on public.birth_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "mapas: apagar os próprios" on public.birth_profiles;
create policy "mapas: apagar os próprios" on public.birth_profiles
  for delete using (user_id = auth.uid());

-- Exclusão de conta pelo próprio usuário (LGPD): apaga o login e, em cascata, os mapas.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
