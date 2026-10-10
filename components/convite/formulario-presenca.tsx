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

export function FormularioPresenca({ convite }: { convite: ConvitePublico }) {
  const [editando, setEditando] = useState(convite.status === 'pendente')
  const [status, setStatus] = useState(convite.status)
  const [vai, setVai] = useState<boolean | null>(convite.status === 'pendente' ? null : convite.status === 'confirmado')
  const [nomes, setNomes] = useState<string[]>(() =>
    Array.from({ length: convite.max_pessoas }, (_, i) => convite.nomes_confirmados[i] ?? ''),
  )
  const [mensagem, setMensagem] = useState(convite.mensagem ?? '')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const nomesPreenchidos = nomes.map((n) => n.trim()).filter(Boolean)

  // O botão fica sempre clicável: no celular um botão desabilitado parece "travado", então explicamos o que falta.
  async function enviar(event: React.FormEvent) {
    event.preventDefault()
    if (enviando) return
    if (!supabase) return setErro('Confirmação indisponível no momento. Tente novamente mais tarde.')
    if (vai === null) return setErro('Escolha se você poderá comparecer.')
    if (vai && nomesPreenchidos.length === 0) return setErro('Preencha o nome de pelo menos uma pessoa.')
    setEnviando(true)
    setErro('')
    const { error } = await supabase.rpc('responder_convite', {
      p_codigo: convite.codigo,
      p_vai: vai,
      p_nomes: vai ? nomesPreenchidos : [],
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
    return status === 'confirmado' ? (
      <div>
        <PartyPopper className="mx-auto size-8 text-acento" strokeWidth={1.2} />
        <h2 className="section-title mt-4">Que alegria!</h2>
        <p className="lead mt-3">
          Presença confirmada para <strong className="font-medium text-azul">{nomesPreenchidos.length || convite.pessoas_confirmadas}</strong>{' '}
          {(nomesPreenchidos.length || convite.pessoas_confirmadas) === 1 ? 'pessoa' : 'pessoas'}. Mal podemos esperar para celebrar com vocês!
        </p>
        <p className="small-caps mt-4 leading-relaxed">{(nomesPreenchidos.length ? nomesPreenchidos : convite.nomes_confirmados).join(' · ')}</p>
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
      <p className="field-label text-center">Você poderá comparecer?</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="choice-card" data-ativo={vai === true} aria-pressed={vai === true} onClick={() => { setVai(true); setErro("") }}>
          <Check className="size-5" strokeWidth={1.4} /> Sim, eu vou!
        </button>
        <button type="button" className="choice-card" data-ativo={vai === false} aria-pressed={vai === false} onClick={() => { setVai(false); setErro("") }}>
          <Frown className="size-5" strokeWidth={1.4} /> Não poderei
        </button>
      </div>

      {vai && (
        <div className="mt-8 space-y-3">
          <p className="field-label">
            {convite.max_pessoas === 1 ? 'Seu nome' : `Quem vai? (até ${convite.max_pessoas} pessoas)`}
          </p>
          {nomes.map((nome, i) => (
            <input
              key={i}
              value={nome}
              onChange={(e) => setNomes((atual) => atual.map((n, j) => (j === i ? e.target.value : n)))}
              placeholder={convite.max_pessoas === 1 ? 'Nome completo' : `Convidado ${i + 1}`}
              aria-label={`Nome do convidado ${i + 1}`}
              autoCapitalize="words"
              autoComplete={i === 0 ? "name" : "off"}
              className="field-input"
            />
          ))}
          {convite.max_pessoas > 1 && <p className="small-caps !tracking-[0.12em]">Deixe em branco quem não poderá ir</p>}
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
