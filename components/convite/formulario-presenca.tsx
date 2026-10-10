'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarPlus, Check, Frown, Gift, Heart, PartyPopper } from 'lucide-react'
import { OrnamentalDivider } from '@/components/convite/moldura'
import { casamento } from '@/lib/casamento'
import { supabase, type ConvitePublico } from '@/lib/supabase'

// 16h em Fortaleza (UTC-3) até meia-noite
const linkCalendario =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  `&text=${encodeURIComponent(`Casamento ${casamento.noivos}`)}` +
  '&dates=20261227T190000Z/20261228T030000Z' +
  `&location=${encodeURIComponent(`${casamento.igreja.nome} — Fortaleza`)}` +
  `&details=${encodeURIComponent(`Cerimônia: ${casamento.igreja.nome}\nRecepção: ${casamento.buffet.nome}, ${casamento.buffet.endereco}`)}`

export function FormularioPresenca({ convite, aoTrocar }: { convite: ConvitePublico; aoTrocar?: () => void }) {
  const convidados = convite.nomes_convidados ?? []
  // Lugares além dos nomes cadastrados viram campos livres ("acompanhante")
  const vagasExtras = Math.max(0, convite.max_pessoas - convidados.length)

  const [editando, setEditando] = useState(convite.status === 'pendente')
  const [status, setStatus] = useState(convite.status)
  const [vai, setVai] = useState<boolean | null>(convite.status === 'pendente' ? null : convite.status === 'confirmado')
  const [marcados, setMarcados] = useState<string[]>(() =>
    convite.status === 'confirmado' ? convidados.filter((n) => convite.nomes_confirmados.includes(n)) : convidados,
  )
  const [extras, setExtras] = useState<string[]>(() => {
    const anteriores = convite.nomes_confirmados.filter((n) => !convidados.includes(n))
    return Array.from({ length: vagasExtras }, (_, i) => anteriores[i] ?? '')
  })
  const [mensagem, setMensagem] = useState(convite.mensagem ?? '')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const nomesFinais = [...convidados.filter((n) => marcados.includes(n)), ...extras.map((n) => n.trim()).filter(Boolean)]

  function alternar(nome: string) {
    setErro('')
    setMarcados((atual) => (atual.includes(nome) ? atual.filter((n) => n !== nome) : [...atual, nome]))
  }

  // O botão fica sempre clicável: no celular um botão desabilitado parece "travado", então explicamos o que falta.
  async function enviar(event: React.FormEvent) {
    event.preventDefault()
    if (enviando) return
    if (!supabase) return setErro('Confirmação indisponível no momento. Tente novamente mais tarde.')
    if (vai === null) return setErro('Escolha se você poderá comparecer.')
    if (vai && nomesFinais.length === 0) return setErro('Marque ou preencha pelo menos uma pessoa.')
    setEnviando(true)
    setErro('')
    const { error } = await supabase.rpc('responder_convite', {
      p_codigo: convite.codigo,
      p_vai: vai,
      p_nomes: vai ? nomesFinais : [],
      p_mensagem: mensagem,
    })
    setEnviando(false)
    if (error) {
      setErro('Não foi possível enviar sua resposta. Tente novamente em instantes.')
      return
    }
    setStatus(vai ? 'confirmado' : 'recusado')
    setEditando(false)
  }

  if (!editando) {
    const confirmados = nomesFinais.length ? nomesFinais : convite.nomes_confirmados
    return status === 'confirmado' ? (
      <div>
        <PartyPopper className="mx-auto size-8 text-acento" strokeWidth={1.2} />
        <h2 className="section-title mt-4">Que alegria!</h2>
        <p className="lead mt-3">
          Presença confirmada para <strong className="font-medium text-azul">{confirmados.length}</strong>{' '}
          {confirmados.length === 1 ? 'pessoa' : 'pessoas'}. Mal podemos esperar para celebrar com vocês!
        </p>
        <p className="small-caps mt-4 leading-relaxed">{confirmados.join(' · ')}</p>
        <OrnamentalDivider />
        <div className="flex flex-col gap-3">
          <a href={linkCalendario} target="_blank" rel="noreferrer" className="btn-primary">Salvar na agenda <CalendarPlus /></a>
          <Link href="/presentes" className="btn-outline">Lista de presentes <Gift /></Link>
          <button type="button" onClick={() => setEditando(true)} className="back-link mx-auto mt-3">Alterar resposta</button>
        </div>
      </div>
    ) : (
      <div>
        <Heart className="mx-auto size-7 text-acento" strokeWidth={1.2} />
        <h2 className="section-title mt-4">Sentiremos sua falta</h2>
        <p className="lead mt-3">Obrigado por nos avisar. Vocês estarão em nossos corações neste dia.</p>
        <OrnamentalDivider />
        <div className="flex flex-col gap-3">
          <Link href="/presentes" className="btn-outline">Lista de presentes <Gift /></Link>
          <button type="button" onClick={() => setEditando(true)} className="back-link mx-auto mt-3">Alterar resposta</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="text-left">
      <div className="mb-7 text-center">
        <p className="small-caps">Convite de</p>
        <p className="mt-1 font-serif text-2xl text-titulo">{convite.nome}</p>
        <p className="small-caps mt-1">
          {convite.max_pessoas} {convite.max_pessoas === 1 ? 'lugar reservado' : 'lugares reservados'}
        </p>
        {aoTrocar && <button type="button" onClick={aoTrocar} className="back-link mt-1">Não é você? Buscar outro nome</button>}
      </div>

      <p className="field-label text-center">Você poderá comparecer?</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="choice-card" data-ativo={vai === true} aria-pressed={vai === true} onClick={() => { setVai(true); setErro('') }}>
          <Check className="size-5" strokeWidth={1.4} /> Sim, eu vou!
        </button>
        <button type="button" className="choice-card" data-ativo={vai === false} aria-pressed={vai === false} onClick={() => { setVai(false); setErro('') }}>
          <Frown className="size-5" strokeWidth={1.4} /> Não poderei
        </button>
      </div>

      {vai && (
        <div className="mt-8 space-y-3">
          <p className="field-label">Quem vai?</p>
          {convidados.map((nome) => (
            <label key={nome} className="check-row" data-ativo={marcados.includes(nome)}>
              <input type="checkbox" checked={marcados.includes(nome)} onChange={() => alternar(nome)} className="sr-only" />
              <span className="check-box" aria-hidden="true"><Check className="size-3.5" strokeWidth={2.5} /></span>
              <span className="font-serif text-lg text-tinta">{nome}</span>
            </label>
          ))}
          {extras.map((nome, i) => (
            <input
              key={i}
              value={nome}
              onChange={(e) => { setErro(''); setExtras((atual) => atual.map((n, j) => (j === i ? e.target.value : n))) }}
              placeholder={convidados.length ? `Acompanhante ${vagasExtras > 1 ? i + 1 : ''}`.trim() : `Convidado ${i + 1}`}
              aria-label={convidados.length ? `Nome do acompanhante ${i + 1}` : `Nome do convidado ${i + 1}`}
              autoCapitalize="words"
              autoComplete="off"
              className="field-input"
            />
          ))}
          <p className="small-caps !tracking-[0.12em]">
            {convidados.length ? 'Desmarque quem não poderá ir' : 'Deixe em branco quem não poderá ir'}
          </p>
        </div>
      )}

      {vai !== null && (
        <div className="mt-8">
          <label htmlFor="mensagem" className="field-label">Deixe um recado para os noivos (opcional)</label>
          <textarea
            id="mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Escreva com carinho…"
            className="field-input resize-none"
          />
        </div>
      )}

      {erro && <p role="alert" className="field-error mt-5">{erro}</p>}

      <button type="submit" aria-busy={enviando} className="btn-primary mt-8 w-full">
        {enviando ? 'Enviando…' : 'Enviar resposta'} <Check />
      </button>
    </form>
  )
}
