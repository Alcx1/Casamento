-- =============================================================
--  Aurea & Alec — estrutura do banco (rode tudo no SQL Editor do Supabase)
-- =============================================================

-- 1) Quem pode acessar o painel /admin
create table if not exists public.admins (
  email text primary key
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 2) Convites (cada família / grupo recebe um código único)
create table if not exists public.convites (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,                      -- ex.: "Família Silva"
  telefone text,                           -- usado para enviar pelo WhatsApp
  max_pessoas int not null default 1 check (max_pessoas between 1 and 20),
  status text not null default 'pendente' check (status in ('pendente', 'confirmado', 'recusado')),
  pessoas_confirmadas int not null default 0,
  nomes_confirmados text[] not null default '{}',
  mensagem text,                           -- recadinho para os noivos
  respondido_em timestamptz,
  criado_em timestamptz not null default now()
);

alter table public.convites enable row level security;

drop policy if exists "admins gerenciam convites" on public.convites;
create policy "admins gerenciam convites" on public.convites
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Convidados NÃO leem a tabela diretamente: só conseguem ver/responder
-- o próprio convite através destas funções, informando o código.
create or replace function public.buscar_convite(p_codigo text)
returns table (
  codigo text,
  nome text,
  max_pessoas int,
  status text,
  pessoas_confirmadas int,
  nomes_confirmados text[],
  mensagem text
)
language sql
stable
security definer
set search_path = public
as $$
  select c.codigo, c.nome, c.max_pessoas, c.status, c.pessoas_confirmadas, c.nomes_confirmados, c.mensagem
  from public.convites c
  where c.codigo = upper(trim(p_codigo));
$$;

create or replace function public.responder_convite(
  p_codigo text,
  p_vai boolean,
  p_nomes text[],
  p_mensagem text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max int;
  v_nomes text[];
begin
  select max_pessoas into v_max from public.convites where codigo = upper(trim(p_codigo));
  if v_max is null then
    return false;
  end if;

  select coalesce(array_agg(trim(n)), '{}') into v_nomes
  from unnest(coalesce(p_nomes, '{}')) as n
  where length(trim(n)) > 0;

  if p_vai and (cardinality(v_nomes) = 0 or cardinality(v_nomes) > v_max) then
    raise exception 'Quantidade de pessoas inválida';
  end if;

  update public.convites set
    status = case when p_vai then 'confirmado' else 'recusado' end,
    pessoas_confirmadas = case when p_vai then cardinality(v_nomes) else 0 end,
    nomes_confirmados = case when p_vai then v_nomes else '{}' end,
    mensagem = nullif(left(trim(coalesce(p_mensagem, '')), 500), ''),
    respondido_em = now()
  where codigo = upper(trim(p_codigo));

  return true;
end;
$$;

grant execute on function public.buscar_convite(text) to anon, authenticated;
grant execute on function public.responder_convite(text, boolean, text[], text) to anon, authenticated;

-- 3) Fotos do casal (bucket público para leitura, escrita só para admins)
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do update set public = true;

drop policy if exists "admins enviam fotos" on storage.objects;
create policy "admins enviam fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and public.is_admin());

drop policy if exists "admins atualizam fotos" on storage.objects;
create policy "admins atualizam fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and public.is_admin());

drop policy if exists "admins removem fotos" on storage.objects;
create policy "admins removem fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and public.is_admin());

drop policy if exists "todos veem fotos" on storage.objects;
create policy "todos veem fotos" on storage.objects
  for select
  using (bucket_id = 'fotos');

-- 4) Cadastre aqui o(s) e-mail(s) dos noivos (os mesmos criados em Authentication > Users)
-- insert into public.admins (email) values ('seu-email@exemplo.com'), ('email-da-aurea@exemplo.com');
