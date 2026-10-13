-- =============================================================
--  Busca parcial pelo nome (como um LIKE por palavra)
--  Rode este arquivo inteiro no SQL Editor do Supabase, depois do 02-confirmacao-por-nome.sql.
--  Pode rodar mais de uma vez sem problema.
--
--  Cada palavra digitada precisa ser o começo de alguma palavra do nome cadastrado:
--    "davi"       -> encontra "João Davi"
--    "jo dav"     -> encontra "João Davi"
--    "davi silva" -> encontra "João Davi Silva"
--  "de", "da", "do", "das", "dos" e "e" são ignorados. Mínimo de 3 letras.
-- =============================================================

drop function if exists public.buscar_convite_por_nome(text);

create function public.buscar_convite_por_nome(p_nome text)
returns table (
  codigo text,
  nome text,
  max_pessoas int,
  status text,
  pessoas_confirmadas int,
  nomes_convidados text[],
  nomes_confirmados text[],
  mensagem text,
  nome_encontrado text
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
#variable_conflict use_column
declare
  v_partes text[];
begin
  select coalesce(array_agg(p), '{}') into v_partes
  from unnest(string_to_array(public.normalizar_nome(p_nome), ' ')) as p
  where p <> '' and p not in ('de', 'da', 'do', 'das', 'dos', 'e');

  if cardinality(v_partes) = 0 or length(array_to_string(v_partes, '')) < 3 then
    return;
  end if;

  -- Devolve no máximo 6: se vierem 6, o site pede para a pessoa digitar também o sobrenome
  return query
  select t.codigo, t.nome, t.max_pessoas, t.status, t.pessoas_confirmadas, t.nomes_convidados, t.nomes_confirmados, t.mensagem, t.nome_encontrado
  from (
    select distinct on (c.id)
      c.codigo, c.nome, c.max_pessoas, c.status, c.pessoas_confirmadas, c.nomes_convidados, c.nomes_confirmados, c.mensagem,
      n as nome_encontrado
    from public.convites c
    cross join lateral unnest(c.nomes_convidados) as n
    where not exists (
      -- nenhuma palavra digitada pode ficar sem par no nome cadastrado
      select 1
      from unnest(v_partes) as parte
      where not exists (
        select 1
        from unnest(string_to_array(public.normalizar_nome(n), ' ')) as palavra
        where palavra like parte || '%'
      )
    )
    order by c.id, n
  ) t
  order by t.nome_encontrado
  limit 6;
end;
$$;

grant execute on function public.buscar_convite_por_nome(text) to anon, authenticated;
