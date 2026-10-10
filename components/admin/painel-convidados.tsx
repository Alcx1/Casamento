'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, MessageCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { casamento } from '@/lib/casamento'
import { supabase, type Convite } from '@/lib/supabase'

const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // sem 0/O, 1/I/L para não confundir

function gerarCodigo() {
  return Array.from(crypto.getRandomValues(new Uint32Array(6)), (n) => ALFABETO[n % ALFABETO.length]).join('')
}

function linkDoConvite(codigo: string) {
  return `${window.location.origin}/?convite=${codigo}`
}

function linkWhatsApp(convite: Convite) {
  const texto =
    `Olá, ${convite.nome}! 💍\n\n` +
    `Com muita alegria, convidamos vocês para celebrar o nosso casamento no dia 27 de dezembro de 2026.\n\n` +
    `Veja o convite e confirme sua presença até ${casamento.prazoConfirmacao}:\n${linkDoConvite(convite.codigo)}\n\n` +
    `Com carinho, ${casamento.noivos}`
  let numero = (convite.telefone ?? '').replace(/\D/g, '')
  if (numero && !numero.startsWith('55')) numero = `55${numero}`
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'recusado', label: 'Não vão' },
] as const

export function PainelConvidados() {
  const [convites, setConvites] = useState<Convite[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<(typeof filtros)[number]['id']>('todos')
  const [busca, setBusca] = useState('')

  async function recarregar() {
    if (!supabase) return
    const { data } = await supabase.from('convites').select('*').order('criado_em', { ascending: false })
    setConvites((data as Convite[]) ?? [])
    setCarregando(false)
  }

  useEffect(() => {
    recarregar()
  }, [])

  const resumo = useMemo(() => {
    const total = convites.reduce((soma, c) => soma + c.max_pessoas, 0)
    const confirmadas = convites.reduce((soma, c) => soma + c.pessoas_confirmadas, 0)
    const contar = (status: Convite['status']) => convites.filter((c) => c.status === status).length
    return { total, confirmadas, pendentes: contar('pendente'), confirmados: contar('confirmado'), recusados: contar('recusado') }
  }, [convites])

  const visiveis = convites.filter(
    (c) => (filtro === 'todos' || c.status === filtro) && [c.nome, ...(c.nomes_convidados ?? [])].some((n) => n.toLowerCase().includes(busca.trim().toLowerCase())),
  )

  function exportarCsv() {
    const linhas = [
      ['Convite', 'Convidados', 'Telefone', 'Lugares', 'Status', 'Confirmados', 'Quem vai', 'Recado', 'Respondido em'],
      ...convites.map((c) => [
        c.nome, (c.nomes_convidados ?? []).join(', '), c.telefone ?? '', c.max_pessoas, c.status, c.pessoas_confirmadas,
        c.nomes_confirmados.join(', '), c.mensagem ?? '', c.respondido_em ? new Date(c.respondido_em).toLocaleString('pt-BR') : '',
      ]),
    ]
    const csv = linhas.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'convidados.csv' })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador valor={`${resumo.confirmadas}/${resumo.total}`} label="Pessoas confirmadas" destaque />
        <Indicador valor={resumo.confirmados} label="Convites confirmados" />
        <Indicador valor={resumo.pendentes} label="Aguardando resposta" />
        <Indicador valor={resumo.recusados} label="Não poderão ir" />
      </div>

      <FormularioConvite aoSalvar={recarregar} />

      <div className="mt-12 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button key={f.id} type="button" onClick={() => setFiltro(f.id)} className={`${filtro === f.id ? 'btn-primary' : 'btn-outline'} !min-h-9 !px-4 !text-[9px]`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-acento" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar" className="field-input !py-2 !pl-9 !text-base" />
          </div>
          <button type="button" onClick={exportarCsv} className="btn-outline !min-h-10 !px-4" title="Exportar planilha"><Download /></button>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {carregando && <li className="small-caps py-6 text-center">Carregando…</li>}
        {!carregando && visiveis.length === 0 && <li className="small-caps py-6 text-center">Nenhum convite por aqui.</li>}
        {visiveis.map((c) => <LinhaConvite key={c.id} convite={c} aoAlterar={recarregar} />)}
      </ul>
    </div>
  )
}

function Indicador({ valor, label, destaque = false }: { valor: React.ReactNode; label: string; destaque?: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-5 text-center ${destaque ? 'border-azul bg-azul text-white' : 'border-borda bg-white text-azul'}`}>
      <p className="font-serif text-4xl leading-none">{valor}</p>
      <p className={`mt-2 font-sans text-[9px] uppercase tracking-[0.18em] ${destaque ? 'text-white/80' : 'text-suave'}`}>{label}</p>
    </div>
  )
}

function paraLista(texto: string) {
  return texto.split(/\n|,|;/).map((n) => n.trim().replace(/\s+/g, ' ')).filter(Boolean)
}

/** Formulário usado tanto para criar quanto para editar um convite. */
function FormularioConvite({ inicial, aoSalvar, aoCancelar }: { inicial?: Convite; aoSalvar: () => Promise<void>; aoCancelar?: () => void }) {
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [telefone, setTelefone] = useState(inicial?.telefone ?? '')
  const [nomesTexto, setNomesTexto] = useState((inicial?.nomes_convidados ?? []).join('\n'))
  const [maxPessoas, setMaxPessoas] = useState(inicial?.max_pessoas ?? 1)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const id = inicial?.id ?? 'novo'
  const convidados = paraLista(nomesTexto)
  const lugares = Math.max(maxPessoas, convidados.length, 1)
  const acompanhantes = lugares - convidados.length

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    if (!supabase || salvando) return
    if (convidados.some((n) => n.split(' ').length < 2)) return setErro('Coloque nome e sobrenome de cada convidado, um por linha.')
    if (lugares > 20) return setErro('Máximo de 20 lugares por convite.')
    setSalvando(true)
    setErro('')
    const dados = { nome: nome.trim(), telefone: telefone.trim() || null, nomes_convidados: convidados, max_pessoas: lugares }
    let error = null
    if (inicial) {
      ;({ error } = await supabase.from('convites').update(dados).eq('id', inicial.id))
    } else {
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        ;({ error } = await supabase.from('convites').insert({ ...dados, codigo: gerarCodigo() }))
        if (error?.code !== '23505') break // 23505 = código repetido, tenta outro
      }
    }
    setSalvando(false)
    if (error) {
      return setErro(
        error.message.includes('nomes_convidados')
          ? 'Rode o arquivo supabase/02-confirmacao-por-nome.sql no Supabase antes de cadastrar nomes.'
          : 'Não foi possível salvar o convite. Verifique se seu e-mail está na tabela de admins.',
      )
    }
    if (!inicial) {
      setNome('')
      setTelefone('')
      setNomesTexto('')
      setMaxPessoas(1)
    }
    await aoSalvar()
  }

  return (
    <form onSubmit={salvar} className={`grid gap-4 md:grid-cols-2 ${inicial ? 'mt-4 border-t border-linha pt-4' : 'paper-card mt-8'}`}>
      <div>
        <label htmlFor={`nome-${id}`} className="field-label">Convite para</label>
        <input id={`nome-${id}`} required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Família Silva" className="field-input" />
      </div>
      <div>
        <label htmlFor={`tel-${id}`} className="field-label">WhatsApp</label>
        <input id={`tel-${id}`} value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(85) 99999-9999" inputMode="tel" className="field-input" />
      </div>
      <div className="md:col-span-2">
        <label htmlFor={`nomes-${id}`} className="field-label">Nomes dos convidados (um por linha)</label>
        <textarea
          id={`nomes-${id}`}
          value={nomesTexto}
          onChange={(e) => { setNomesTexto(e.target.value); setErro('') }}
          rows={Math.max(3, convidados.length + 1)}
          placeholder={'João Silva\nMaria Silva\nPedro Silva'}
          className="field-input resize-y"
        />
        <p className="small-caps mt-2 !tracking-[0.12em]">É por esses nomes que cada convidado encontra o convite ao confirmar</p>
      </div>
      <div>
        <label htmlFor={`lugares-${id}`} className="field-label">Lugares no convite</label>
        <input
          id={`lugares-${id}`}
          type="number"
          min={Math.max(1, convidados.length)}
          max={20}
          value={lugares}
          onChange={(e) => setMaxPessoas(Number(e.target.value) || 1)}
          className="field-input"
        />
        <p className="small-caps mt-2 !tracking-[0.12em]">
          {convidados.length} {convidados.length === 1 ? 'nome' : 'nomes'}
          {acompanhantes > 0 && ` + ${acompanhantes} ${acompanhantes === 1 ? 'acompanhante' : 'acompanhantes'}`}
        </p>
      </div>
      <div className="flex items-start gap-2 md:items-center md:justify-end md:pt-3">
        {aoCancelar && <button type="button" onClick={aoCancelar} className="btn-outline">Cancelar</button>}
        <button type="submit" aria-busy={salvando} className="btn-primary flex-1 md:flex-none">
          {salvando ? 'Salvando…' : inicial ? 'Salvar' : 'Adicionar'} {inicial ? <Check /> : <Plus />}
        </button>
      </div>
      {erro && <p role="alert" className="field-error !text-left md:col-span-2">{erro}</p>}
    </form>
  )
}

function LinhaConvite({ convite, aoAlterar }: { convite: Convite; aoAlterar: () => Promise<void> }) {
  const [copiado, setCopiado] = useState(false)
  const [editando, setEditando] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(linkDoConvite(convite.codigo))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function excluir() {
    if (!supabase || !confirm(`Excluir o convite de ${convite.nome}?`)) return
    await supabase.from('convites').delete().eq('id', convite.id)
    await aoAlterar()
  }

  return (
    <li className="rounded-2xl border border-borda bg-white px-5 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-xl text-titulo">{convite.nome}</p>
            <span className="status-pill" data-status={convite.status}>
              {convite.status === 'confirmado' ? 'Confirmado' : convite.status === 'recusado' ? 'Não vai' : 'Pendente'}
            </span>
          </div>
          <p className="small-caps mt-1 !tracking-[0.14em]">
            {convite.status === 'confirmado' ? `${convite.pessoas_confirmadas} de ${convite.max_pessoas}` : convite.max_pessoas}{' '}
            {convite.max_pessoas === 1 ? 'lugar' : 'lugares'}
          </p>
          {(convite.nomes_convidados ?? []).length > 0 && (
            <p className="mt-1 font-serif text-[15px] text-suave">Convidados: {convite.nomes_convidados.join(' · ')}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditando((v) => !v)} className="btn-outline !min-h-10 !px-4" title="Editar convite" aria-expanded={editando}><Pencil /></button>
          <button type="button" onClick={copiar} className="btn-outline !min-h-10 !px-4" title="Copiar link do convite">{copiado ? <Check /> : <Copy />}</button>
          <a href={linkWhatsApp(convite)} target="_blank" rel="noreferrer" className="btn-outline !min-h-10 !px-4" title="Enviar pelo WhatsApp"><MessageCircle /></a>
          <button type="button" onClick={excluir} className="btn-outline !min-h-10 !px-4" title="Excluir convite"><Trash2 /></button>
        </div>
      </div>
      {(convite.nomes_confirmados.length > 0 || convite.mensagem) && (
        <div className="mt-3 border-t border-linha pt-3 font-serif text-[15px] text-texto">
          {convite.nomes_confirmados.length > 0 && <p>Vão: {convite.nomes_confirmados.join(' · ')}</p>}
          {convite.mensagem && <p className="mt-1 italic text-suave">“{convite.mensagem}”</p>}
        </div>
      )}
      {editando && (
        <FormularioConvite
          inicial={convite}
          aoCancelar={() => setEditando(false)}
          aoSalvar={async () => { setEditando(false); await aoAlterar() }}
        />
      )}
    </li>
  )
}
