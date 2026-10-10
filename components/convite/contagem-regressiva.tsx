'use client'

import { useEffect, useState } from 'react'
import { casamento } from '@/lib/casamento'

const alvo = new Date(casamento.dataHora).getTime()

function calcular() {
  const restante = Math.max(0, alvo - Date.now())
  return {
    restante,
    dias: Math.floor(restante / 86_400_000),
    horas: Math.floor((restante / 3_600_000) % 24),
    minutos: Math.floor((restante / 60_000) % 60),
    segundos: Math.floor((restante / 1000) % 60),
  }
}

export function ContagemRegressiva() {
  // Só calcula no navegador, para o servidor e o celular não mostrarem números diferentes
  const [tempo, setTempo] = useState<ReturnType<typeof calcular> | null>(null)

  useEffect(() => {
    setTempo(calcular())
    const id = setInterval(() => setTempo(calcular()), 1000)
    return () => clearInterval(id)
  }, [])

  if (tempo && tempo.restante === 0) {
    return <p className="section-title">Chegou o grande dia!</p>
  }

  const unidades = [
    { valor: tempo?.dias, label: tempo?.dias === 1 ? 'Dia' : 'Dias' },
    { valor: tempo?.horas, label: 'Horas' },
    { valor: tempo?.minutos, label: 'Minutos' },
    { valor: tempo?.segundos, label: 'Segundos' },
  ]

  return (
    <div className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-4" role="timer" aria-live="off">
      {unidades.map((u) => (
        <div key={u.label} className="countdown-cell">
          <span className="countdown-number">{u.valor === undefined ? '--' : String(u.valor).padStart(2, '0')}</span>
          <span className="countdown-label">{u.label}</span>
        </div>
      ))}
    </div>
  )
}
