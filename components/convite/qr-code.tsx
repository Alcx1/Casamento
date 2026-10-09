'use client'

import { useEffect, useRef, useState } from 'react'
import { QrCode } from 'lucide-react'

/** Mostra a imagem do QR Code; enquanto o arquivo não existir em /public, exibe um espaço reservado. */
export function QrCodePix({ src }: { src: string }) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [erro, setErro] = useState(false)

  // A imagem pode falhar antes do React hidratar, quando o onError ainda não existe.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth === 0) setErro(true)
  }, [])

  return (
    <div className="photo-slot relative mx-auto aspect-square w-full max-w-[260px] bg-white p-5">
      {erro ? (
        <span className="flex flex-col items-center gap-3 text-[#6e7f91]">
          <span className="flex size-12 items-center justify-center rounded-full border border-[#9bb6c8] bg-white/70">
            <QrCode aria-hidden="true" className="size-6" strokeWidth={1.3} />
          </span>
          <span className="font-sans text-[10px] uppercase tracking-[0.28em]">QR Code Pix</span>
        </span>
      ) : (
        <img ref={imgRef} src={src} alt="QR Code para presentear via Pix" onError={() => setErro(true)} className="relative z-10 size-full bg-white object-contain" />
      )}
    </div>
  )
}
