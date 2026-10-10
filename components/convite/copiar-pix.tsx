'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopiarPix({ chave, copiaECola = false }: { chave: string; copiaECola?: boolean }) {
  const [copiado, setCopiado] = useState(false)
  const nome = copiaECola ? 'código Pix' : 'chave Pix'

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      window.prompt(`Copie o ${nome}:`, chave)
    }
  }

  return (
    <button type="button" onClick={copiar} className="btn-primary w-full sm:w-auto">
      {copiado ? <>Copiado! <Check /></> : <>Copiar {nome} <Copy /></>}
    </button>
  )
}
