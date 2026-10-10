'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Music, VolumeX } from 'lucide-react'
import { casamento } from '@/lib/casamento'

type ContextoMusica = { aberto: boolean; tocando: boolean; disponivel: boolean; abrir: () => void; alternar: () => void }

const Contexto = createContext<ContextoMusica>({ aberto: true, tocando: false, disponivel: false, abrir: () => {}, alternar: () => {} })

export const useMusica = () => useContext(Contexto)

/**
 * Fica no layout raiz para a música continuar tocando ao navegar entre as páginas.
 * Os navegadores só permitem som depois de um toque, por isso a música começa no "abrir o convite".
 */
export function MusicaProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)
  const [tocando, setTocando] = useState(false)
  const [disponivel, setDisponivel] = useState(false)

  // Só mostra o botão de música se o arquivo existir em /public
  useEffect(() => {
    fetch(casamento.musica, { method: 'HEAD' })
      .then((r) => setDisponivel(r.ok))
      .catch(() => setDisponivel(false))
  }, [])

  // Fora da página inicial não há tela de abertura
  useEffect(() => {
    if (pathname !== '/') setAberto(true)
  }, [pathname])

  const tocar = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !disponivel) return
    audio.volume = 0
    audio.play().then(() => {
      setTocando(true)
      // Entrada suave do volume
      let v = 0
      const subir = setInterval(() => {
        v = Math.min(0.6, v + 0.05)
        audio.volume = v
        if (v >= 0.6) clearInterval(subir)
      }, 120)
    }).catch(() => setTocando(false))
  }, [disponivel])

  const abrir = useCallback(() => {
    setAberto(true)
    tocar()
  }, [tocar])

  const alternar = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) tocar()
    else {
      audio.pause()
      setTocando(false)
    }
  }, [tocar])

  const mostrarBotao = disponivel && aberto && !pathname.startsWith('/admin')

  return (
    <Contexto.Provider value={{ aberto, tocando, disponivel, abrir, alternar }}>
      {children}
      <audio ref={audioRef} src={casamento.musica} loop preload="none" onError={() => setDisponivel(false)} />
      {mostrarBotao && (
        <button
          type="button"
          onClick={alternar}
          className="music-toggle"
          data-tocando={tocando}
          aria-label={tocando ? 'Pausar música' : 'Tocar música'}
          title={tocando ? 'Pausar música' : 'Tocar música'}
        >
          {tocando ? <Music className="size-4" strokeWidth={1.6} /> : <VolumeX className="size-4" strokeWidth={1.6} />}
        </button>
      )}
    </Contexto.Provider>
  )
}
