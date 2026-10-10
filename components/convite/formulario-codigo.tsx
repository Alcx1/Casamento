'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function FormularioCodigo() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')

  function enviar(event: React.FormEvent) {
    event.preventDefault()
    const limpo = codigo.trim().toUpperCase()
    if (!limpo) return setErro('Digite o código que veio no seu convite.')
    router.push(`/confirmar/${encodeURIComponent(limpo)}`)
  }

  return (
    <form onSubmit={enviar} className="mx-auto max-w-sm">
      <label htmlFor="codigo" className="field-label text-center">Código do convite</label>
      <input
        id="codigo"
        value={codigo}
        onChange={(e) => { setCodigo(e.target.value); setErro('') }}
        placeholder="Ex.: AB12CD"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        enterKeyHint="go"
        className="field-input text-center uppercase tracking-[0.3em]"
      />
      {erro && <p role="alert" className="field-error mt-3">{erro}</p>}
      <button type="submit" className="btn-primary mt-5 w-full">Continuar <ArrowRight /></button>
    </form>
  )
}
