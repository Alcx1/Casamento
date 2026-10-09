'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function FormularioCodigo() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')

  function enviar(event: React.FormEvent) {
    event.preventDefault()
    const limpo = codigo.trim().toUpperCase()
    if (limpo) router.push(`/confirmar/${encodeURIComponent(limpo)}`)
  }

  return (
    <form onSubmit={enviar} className="mx-auto max-w-sm">
      <label htmlFor="codigo" className="field-label text-center">Código do convite</label>
      <input
        id="codigo"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Ex.: AB12CD"
        autoComplete="off"
        autoCapitalize="characters"
        className="field-input text-center uppercase tracking-[0.3em]"
      />
      <button type="submit" disabled={!codigo.trim()} className="btn-primary mt-5 w-full">Continuar <ArrowRight /></button>
    </form>
  )
}
