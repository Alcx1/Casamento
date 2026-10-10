'use client'

import { useEffect } from 'react'
import { Heart } from 'lucide-react'
import { ArabescoRodape, ArabescoTopo } from '@/components/convite/moldura'
import { useMusica } from '@/components/convite/musica'
import { casamento } from '@/lib/casamento'

/** Tela de entrada do convite: o toque em "Abrir convite" também libera a música. */
export function Abertura({ convidado }: { convidado?: string }) {
  const { aberto, abrir, disponivel } = useMusica()

  // Trava a rolagem da página enquanto a abertura está na tela
  useEffect(() => {
    document.body.style.overflow = aberto ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [aberto])

  return (
    <div className="abertura" data-aberto={aberto} aria-hidden={aberto}>
      <div className="abertura-cartao hero-section">
        <ArabescoTopo />
        <p className="eyebrow relative">Você recebeu um convite</p>
        <Heart className="relative mx-auto mt-8 size-5 fill-current text-ornamento" strokeWidth={1} aria-hidden="true" />
        <p className="names-small relative mt-6">{casamento.noivos}</p>
        <p className="relative mt-6 font-sans text-[10px] uppercase tracking-[0.3em] text-acento">{casamento.data}</p>
        {convidado && (
          <p className="relative mt-8 font-serif text-lg italic text-texto">
            Para <span className="not-italic font-medium text-azul">{convidado}</span>
          </p>
        )}
        <button type="button" onClick={abrir} tabIndex={aberto ? -1 : 0} className="btn-primary relative mt-10">Abrir convite</button>
        {disponivel && <p className="small-caps relative mt-4">Com música ♪</p>}
        <ArabescoRodape />
      </div>
    </div>
  )
}
