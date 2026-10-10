-- =============================================================
--  Confirmação de presença pelo NOME (sem código)
--  Rode este arquivo inteiro no SQL Editor do Supabase, depois do schema.sql.
--  Pode rodar mais de uma vez sem problema.
-- =============================================================

create extension if not exists unaccent with schema extensions;

-- 1) Lista de quem foi convidado em cada convite
alter table public.convites add column if not exists nomes_convidados text[] not null default '{}';

-- 2) "Maria  Sílva" -> "maria silva" (ignora acentos, maiúsculas e espaços extras)
create or replace function public.normalizar_nome(p text)
returns text
language sql
stable
set search_path = public, extensions
as $$
  select trim(regexp_replace(regexp_replace(lower(extensions.unaccent(coalesce(p, ''))), '[^a-z0-9 ]', ' ', 'g'), '\s+', ' ', 'g'));
$$;

-- 3) Código gerado automaticamente (continua existindo, mas o convidado nunca precisa digitar;
--    ele só aparece escondido no link personalizado ?convite=XXXX)
create or replace function public.gerar_codigo_convite()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alfabeto text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v text;
begin
  loop
    v := '';
    for i in 1..6 loop
      v := v || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from public.convites where codigo = v);
  end loop;
  return v;
end;
$$;

alter table public.convites alter column codigo set default public.gerar_codigo_convite();

-- 4) Limpa a lista de nomes e garante que os lugares nunca sejam menos que os nomes cadastrados
create or replace function public.ajustar_convite()
returns trigger
language plpgsql
as $$
begin
  select coalesce(array_agg(trim(n) order by i), '{}') into new.nomes_convidados
  from unnest(coalesce(new.nomes_convidados, '{}')) with ordinality as t(n, i)
  where length(trim(n)) > 0;

  new.max_pessoas := greatest(coalesce(new.max_pessoas, 1), cardinality(new.nomes_convidados), 1);
  return new;
end;
$$;

drop trigger if exists ajustar_convite on public.convites;
create trigger ajustar_convite
  before insert or update of nomes_convidados, max_pessoas on public.convites
  for each row execute function public.ajustar_convite();

-- 5) Busca pelo nome: exige nome e sobrenome e devolve só o(s) convite(s) daquela pessoa.
--    "maria silva" encontra "Maria Clara da Silva" (mesmo primeiro nome + sobrenome contido).
create or replace function public.buscar_convite_por_nome(p_nome text)
returns table (
  codigo text,
  nome text,
  max_pessoas int,
  status text,
  pessoas_confirmadas int,
  nomes_convidados text[],
  nomes_confirmados text[],
  mensagem text
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
#variable_conflict use_column
declare
  v_busca text := public.normalizar_nome(p_nome);
  v_partes text[] := string_to_array(v_busca, ' ');
begin
  if coalesce(cardinality(v_partes), 0) < 2 or length(v_busca) < 5 then
    return;
  end if;

  return query
  select c.codigo, c.nome, c.max_pessoas, c.status, c.pessoas_confirmadas, c.nomes_convidados, c.nomes_confirmados, c.mensagem
  from public.convites c
  where exists (
    select 1
    from unnest(c.nomes_convidados) as n
    where public.normalizar_nome(n) = v_busca
       or (
         split_part(public.normalizar_nome(n), ' ', 1) = v_partes[1]
         and string_to_array(public.normalizar_nome(n), ' ') @> v_partes
       )
  )
  order by c.nome
  limit 5;
end;
$$;

-- 6) A busca pelo link personalizado passa a devolver também a lista de convidados
drop function if exists public.buscar_convite(text);
create function public.buscar_convite(p_codigo text)
returns table (
  codigo text,
  nome text,
  max_pessoas int,
  status text,
  pessoas_confirmadas int,
  nomes_convidados text[],
  nomes_confirmados text[],
  mensagem text
)
language sql
stable
security definer
set search_path = public
as $$
  select c.codigo, c.nome, c.max_pessoas, c.status, c.pessoas_confirmadas, c.nomes_convidados, c.nomes_confirmados, c.mensagem
  from public.convites c
  where c.codigo = upper(trim(p_codigo));
$$;

grant execute on function public.buscar_convite(text) to anon, authenticated;
grant execute on function public.buscar_convite_por_nome(text) to anon, authenticated;

-- =============================================================
--  Exemplo de cadastro direto pelo SQL (o painel /admin faz o mesmo):
--
--  insert into public.convites (nome, telefone, nomes_convidados, max_pessoas) values
--    ('Família Silva', '85999999999', array['João Silva', 'Maria Silva', 'Pedro Silva'], 3),
--    ('Ana Souza', null, array['Ana Souza'], 2);   -- 2 lugares: Ana + 1 acompanhante
--
--  Pelo Table Editor, a coluna nomes_convidados é preenchida assim:
--    {"João Silva","Maria Silva","Pedro Silva"}
-- =============================================================
