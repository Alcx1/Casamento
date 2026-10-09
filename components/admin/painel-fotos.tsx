'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Trash2, Upload } from 'lucide-react'
import { BUCKET_FOTOS, PASTA_FOTOS, slotsDeFoto } from '@/lib/casamento'
import { buscarFotos, supabase } from '@/lib/supabase'

/** Reduz a foto para no máximo 1800px e JPEG, deixando o convite leve no celular. */
async function comprimir(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao comprimir'))), 'image/jpeg', 0.86),
  )
}

export function PainelFotos() {
  const [fotos, setFotos] = useState<Record<string, string>>({})

  async function recarregar() {
    setFotos(await buscarFotos())
  }

  useEffect(() => {
    recarregar()
  }, [])

  return (
    <div className="text-center">
      <p className="eyebrow">Momentos que guardamos</p>
      <p className="lead mx-auto mt-3 max-w-md">Estas fotos aparecem no convite. Só vocês conseguem trocá-las por aqui.</p>
      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
        {slotsDeFoto.map((slot) => (
          <SlotFoto key={slot.id} id={slot.id} label={slot.label} src={fotos[slot.id]} aoAlterar={recarregar} />
        ))}
      </div>
    </div>
  )
}

function SlotFoto({ id, label, src, aoAlterar }: { id: string; label: string; src?: string; aoAlterar: () => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const caminho = `${PASTA_FOTOS}/${id}`

  async function enviar(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0]
    event.target.value = ''
    if (!arquivo || !supabase) return
    setOcupado(true)
    setErro('')
    try {
      const blob = await comprimir(arquivo)
      const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(caminho, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' })
      if (error) throw error
      await aoAlterar()
    } catch {
      setErro('Não foi possível enviar. Verifique se seu e-mail está na tabela de admins.')
    } finally {
      setOcupado(false)
    }
  }

  async function remover() {
    if (!supabase || !confirm(`Remover "${label}"?`)) return
    setOcupado(true)
    await supabase.storage.from(BUCKET_FOTOS).remove([caminho])
    await aoAlterar()
    setOcupado(false)
  }

  return (
    <div>
      <div className="photo-slot relative aspect-[4/5] overflow-hidden">
        {src ? (
          <img src={src} alt={label} className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-3 text-[#6e7f91]">
            <span className="flex size-11 items-center justify-center rounded-full border border-[#9bb6c8] bg-white/70"><Camera className="size-5" strokeWidth={1.4} /></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.28em]">{label}</span>
          </span>
        )}
        {ocupado && <span className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 small-caps">Enviando…</span>}
      </div>
      <p className="small-caps mt-4">{label}</p>
      <div className="mt-3 flex justify-center gap-2">
        <button type="button" disabled={ocupado} onClick={() => inputRef.current?.click()} className="btn-primary !px-5">{src ? 'Trocar' : 'Enviar'} <Upload /></button>
        {src && <button type="button" disabled={ocupado} onClick={remover} className="btn-outline !px-4" aria-label={`Remover ${label}`}><Trash2 /></button>}
      </div>
      {erro && <p className="mt-3 font-sans text-xs text-[#9a5f5f]">{erro}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={enviar} className="sr-only" />
    </div>
  )
}
