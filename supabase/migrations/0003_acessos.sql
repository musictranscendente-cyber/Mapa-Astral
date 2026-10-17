-- Mapa Astral — contagem simples de acessos (anônima).
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- Cada aparelho recebe um código aleatório (sem nome, e-mail ou IP). Qualquer visitante
-- pode registrar eventos, mas só o dono do app consegue ler os números (função app_stats).

create table if not exists public.app_events (
  id          bigint generated always as identity primary key,
  kind        text not null check (kind in ('visita', 'mapa', 'compartilhar')),
  visitor     text not null check (char_length(visitor) between 8 and 40),
  source      text check (char_length(source) <= 60),
  created_at  timestamptz not null default now()
);

create index if not exists app_events_created_idx on public.app_events (created_at);

alter table public.app_events enable row level security;

drop policy if exists "eventos: registrar" on public.app_events;
create policy "eventos: registrar" on public.app_events
  for insert to anon, authenticated with check (true);
-- Sem política de leitura: ninguém lê a tabela diretamente.

create extension if not exists pgcrypto with schema extensions;

-- Números dos últimos p_days dias, só para o e-mail do dono (comparado por SHA-256).
create or replace function public.app_stats(p_days int default 30)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  since timestamptz := now() - make_interval(days => greatest(1, least(p_days, 365)));
begin
  if encode(extensions.digest(lower(coalesce(auth.jwt() ->> 'email', '')), 'sha256'), 'hex') not in (
    '038af17a8e8b545e9547aaac6d35d608d98f92a05bb47142805ecb58e10f2510'
  ) then
    raise exception 'acesso negado';
  end if;

  return json_build_object(
    'daily', (
      select coalesce(json_agg(d order by d.day), '[]'::json) from (
        select (e.created_at at time zone 'America/Sao_Paulo')::date as day,
               count(distinct e.visitor) filter (where e.kind = 'visita') as visitantes,
               count(*) filter (where e.kind = 'mapa') as mapas,
               count(*) filter (where e.kind = 'compartilhar') as compartilhamentos
        from public.app_events e
        where e.created_at >= since
        group by 1
      ) d
    ),
    'totals', json_build_object(
      'visitantes', (select count(distinct visitor) from public.app_events where kind = 'visita' and created_at >= since),
      'visitas', (select count(*) from public.app_events where kind = 'visita' and created_at >= since),
      'mapas', (select count(*) from public.app_events where kind = 'mapa' and created_at >= since),
      'compartilhamentos', (select count(*) from public.app_events where kind = 'compartilhar' and created_at >= since),
      'contas', (select count(*) from auth.users)
    ),
    'sources', (
      select coalesce(json_agg(s), '[]'::json) from (
        select coalesce(source, 'direto') as origem, count(*) as visitas
        from public.app_events
        where kind = 'visita' and created_at >= since
        group by 1 order by 2 desc limit 8
      ) s
    )
  );
end;
$$;

revoke all on function public.app_stats(int) from public, anon;
grant execute on function public.app_stats(int) to authenticated;
