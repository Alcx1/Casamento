'use client'

import { useState } from 'react'
import { ChevronRight, MessageCircle, Search } from 'lucide-react'
import { FormularioPresenca } from '@/components/convite/formulario-presenca'
import { casamento } from '@/lib/casamento'
import { buscarConvitePorNome, type ConvitePublico } from '@/lib/supabase'

const linkNoivos = `https://wa.me/${casamento.contatoWhatsApp}?text=${encodeURIComponent('Olá! Tentei confirmar minha presença no casamento, mas não encontrei meu nome na lista.')}`

const AVISO = 'Digite seu nome e sobrenome, como está no convite.'

/** Confirmação sem código: a pessoa digita o próprio nome e o sistema encontra o convite dela. */
export function BuscaPorNome() {
  const [nome, setNome] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState('')
  const [resultados, setResultados] = useState<ConvitePublico[] | null>(null)
  const [escolhido, setEscolhido] = useState<ConvitePublico | null>(null)

  function recomecar() {
    setEscolhido(null)
    setResultados(null)
    setErro('')
  }

  async function buscar(event: React.FormEvent) {
    event.preventDefault()
    if (buscando) return
    const limpo = nome.trim().replace(/\s+/g, ' ')
    if (limpo.split(' ').length < 2) return setErro(AVISO)
    setBuscando(true)
    setErro('')
    try {
      const encontrados = await buscarConvitePorNome(limpo)
      setResultados(encontrados)
      if (encontrados.length === 1) setEscolhido(encontrados[0])
    } catch {
      setErro('Não foi possível buscar agora.')
    } finally {
      setBuscando(false)
    }
  }

  if (escolhido) return <FormularioPresenca key={escolhido.codigo} convite={escolhido} aoTrocar={recomecar} />

  // Homônimos: mais de um convite com esse nome
  if (resultados && resultados.length > 1) {
    return (
      <div>
        <p className="field-label text-center">Encontramos mais de um convite</p>
        <p className="lead text-center">Qual é o seu?</p>
        <div className="mt-6 space-y-3">
          {resultados.map((c) => (
            <button key={c.codigo} type="button" onClick={() => setEscolhido(c)} className="check-row w-full justify-between text-left">
              <span>
                <span className="block font-serif text-lg text-tinta">{c.nome}</span>
                <span className="small-caps">{c.nomes_convidados.join(' · ')}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-acento" />
            </button>
          ))}
        </div>
        <button type="button" onClick={recomecar} className="back-link mx-auto mt-6 flex">Buscar outro nome</button>
      </div>
    )
  }

  return (
    <form onSubmit={buscar} className="mx-auto max-w-sm">
      <label htmlFor="nome-convidado" className="field-label text-center">Seu nome e sobrenome</label>
      <input
        id="nome-convidado"
        value={nome}
        onChange={(e) => { setNome(e.target.value); setErro(''); setResultados(null) }}
        placeholder="Ex.: Maria Silva"
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="search"
        className="field-input text-center"
      />
      {(erro || (resultados && resultados.length === 0)) && (
        <div role="alert" className="mt-5 rounded-xl bg-nevoa px-4 py-4 text-center">
          <p className="font-serif text-lg text-titulo">{erro && erro !== AVISO ? erro : 'Não encontramos esse nome'}</p>
          <p className="small-caps mt-1 !tracking-[0.12em] leading-relaxed">{AVISO}</p>
          <p className="small-caps mt-3 !tracking-[0.12em]">Ainda com dúvida?</p>
          <a href={linkNoivos} target="_blank" rel="noreferrer" className="btn-outline mt-2 !min-h-10 !px-5">Chamar no WhatsApp <MessageCircle /></a>
        </div>
      )}

      <button type="submit" aria-busy={buscando} className="btn-primary mt-5 w-full">
        {buscando ? 'Procurando…' : 'Encontrar meu convite'} <Search />
      </button>
    </form>
  )
}
