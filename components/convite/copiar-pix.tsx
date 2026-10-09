'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopiarPix({ chave }: { chave: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      window.prompt('Copie a chave Pix:', chave)
    }
  }

  return (
    <button type="button" onClick={copiar} className="btn-primary w-full sm:w-auto">
      {copiado ? <>Chave copiada <Check /></> : <>Copiar chave Pix <Copy /></>}
    </button>
  )
}
