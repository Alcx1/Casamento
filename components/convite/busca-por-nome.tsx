'use client'

import { useState } from 'react'
import { ChevronRight, MessageCircle, Search } from 'lucide-react'
import { FormularioPresenca } from '@/components/convite/formulario-presenca'
import { casamento } from '@/lib/casamento'
import { buscarConvitePorNome, type ConvitePublico } from '@/lib/supabase'

const linkNoivos = `https://wa.me/${casamento.contatoWhatsApp}?text=${encodeURIComponent('Olá! Tentei confirmar minha presença no casamento, mas não encontrei meu nome na lista.')}`

const AVISO = 'Digite seu nome e sobrenome, como está no convite.'
// O banco devolve no máximo 6; se vierem 6, o nome é comum demais e pedimos o sobrenome
const LIMITE_RESULTADOS = 6

type Aviso = { titulo: string; detalhe: string }

/** Confirmação sem código: a pessoa digita o próprio nome (ou parte dele) e o sistema encontra o convite. */
export function BuscaPorNome() {
  const [nome, setNome] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [resultados, setResultados] = useState<ConvitePublico[] | null>(null)
  const [escolhido, setEscolhido] = useState<ConvitePublico | null>(null)

  function recomecar() {
    setEscolhido(null)
    setResultados(null)
    setAviso(null)
  }

  async function buscar(event: React.FormEvent) {
    event.preventDefault()
    if (buscando) return
    const limpo = nome.trim().replace(/\s+/g, ' ')
    if (limpo.replace(/[^\p{L}\d]/gu, '').length < 3) {
      return setAviso({ titulo: 'Nome muito curto', detalhe: 'Digite pelo menos 3 letras do seu nome.' })
    }
    setBuscando(true)
    setAviso(null)
    setResultados(null)
    try {
      const encontrados = await buscarConvitePorNome(limpo)
      if (encontrados.length === 0) setAviso({ titulo: 'Não encontramos esse nome', detalhe: AVISO })
      else if (encontrados.length >= LIMITE_RESULTADOS) setAviso({ titulo: 'Encontramos muitos convites com esse nome', detalhe: 'Digite também o seu sobrenome.' })
      else if (encontrados.length === 1) setEscolhido(encontrados[0])
      else setResultados(encontrados)
    } catch {
      setAviso({ titulo: 'Não foi possível buscar agora', detalhe: 'Tente novamente em instantes.' })
    } finally {
      setBuscando(false)
    }
  }

  if (escolhido) return <FormularioPresenca key={escolhido.codigo} convite={escolhido} aoTrocar={recomecar} />

  // Mais de um convite combina com o que foi digitado
  if (resultados && resultados.length > 1) {
    return (
      <div>
        <p className="field-label text-center">Encontramos mais de um convite</p>
        <p className="lead text-center">Qual é você?</p>
        <div className="mt-6 space-y-3">
          {resultados.map((c) => (
            <button key={c.codigo} type="button" onClick={() => setEscolhido(c)} className="check-row w-full justify-between text-left">
              <span>
                <span className="block font-serif text-lg text-tinta">{c.nome_encontrado ?? c.nome}</span>
                <span className="small-caps">Convite de {c.nome}</span>
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
      <label htmlFor="nome-convidado" className="field-label text-center">Seu nome</label>
      <input
        id="nome-convidado"
        value={nome}
        onChange={(e) => { setNome(e.target.value); setAviso(null) }}
        placeholder="Ex.: Maria ou Maria Silva"
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="search"
        className="field-input text-center"
      />
      {aviso && (
        <div role="alert" className="mt-5 rounded-xl bg-nevoa px-4 py-4 text-center">
          <p className="font-serif text-lg text-titulo">{aviso.titulo}</p>
          <p className="small-caps mt-1 !tracking-[0.12em] leading-relaxed">{aviso.detalhe}</p>
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
