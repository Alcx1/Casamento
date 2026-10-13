-- =============================================================
--  Busca flexível pelo nome (substitui a do 03-busca-parcial.sql)
--  Rode este arquivo inteiro no SQL Editor do Supabase. Pode rodar mais de uma vez.
--
--  Basta UMA palavra digitada bater com o nome cadastrado (pelo começo da palavra):
--    cadastrado "Alec"         <- "Emanuel Alec", "Alec", "Ale"
--    cadastrado "João Davi"    <- "Davi", "Dav", "João", "Davi Souza"
--  Quem combina com MAIS palavras tem prioridade: digitando "Maria Silva",
--  aparece só a "Maria Silva", e não todas as Marias.
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

  return query
  with candidatos as (
    -- Para cada convidado cadastrado: quantas palavras digitadas combinam com o nome dele
    select
      c.id as convite_id,
      n as convidado,
      (
        select count(*)
        from unnest(v_partes) as parte
        where exists (
          select 1
          from unnest(string_to_array(public.normalizar_nome(n), ' ')) as palavra
          where palavra like parte || '%'                                   -- "dav"   -> "davi"
             or (length(palavra) >= 3 and parte like palavra || '%')        -- "alecs" -> "alec"
        )
      ) as pontos
    from public.convites c
    cross join lateral unnest(c.nomes_convidados) as n
  ),
  melhor_por_convite as (
    -- Um resultado por convite: o convidado que mais combinou
    select distinct on (cand.convite_id) cand.convite_id, cand.convidado, cand.pontos
    from candidatos cand
    where cand.pontos > 0
    order by cand.convite_id, cand.pontos desc, cand.convidado
  )
  select c.codigo, c.nome, c.max_pessoas, c.status, c.pessoas_confirmadas,
         c.nomes_convidados, c.nomes_confirmados, c.mensagem, m.convidado
  from melhor_por_convite m
  join public.convites c on c.id = m.convite_id
  where m.pontos = (select max(m2.pontos) from melhor_por_convite m2)  -- só os que mais combinaram
  order by m.convidado
  limit 6;  -- se vierem 6, o site pede para a pessoa digitar também o sobrenome
end;
$$;

grant execute on function public.buscar_convite_por_nome(text) to anon, authenticated;
