import Link from 'next/link'
import { ArrowLeft, Music } from 'lucide-react'
import { casamento } from '@/lib/casamento'

export function ArabescoTopo() {
  return (
    <img
      src="/arabesco.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -top-2 h-auto w-full max-w-none -translate-x-1/2 select-none opacity-90 mix-blend-multiply sm:-top-10"
    />
  )
}

export function OrnamentalDivider() {
  return <div aria-hidden="true" className="ornamental-divider"><span>✦</span></div>
}

/** Fundo creme + "folha" do convite centralizada. Usado em todas as páginas. */
export function Moldura({ children, larga = false }: { children: React.ReactNode; larga?: boolean }) {
  return (
    <main className="min-h-screen bg-creme px-3 py-3 text-tinta sm:px-6 sm:py-6">
      <div className={`invitation-shell mx-auto overflow-hidden bg-papel shadow-[0_18px_70px_rgba(63,77,91,0.14)] ${larga ? 'max-w-[1040px]' : 'max-w-[760px]'}`}>
        {children}
      </div>
    </main>
  )
}

/** Cabeçalho das páginas internas (presentes, confirmação), com o arabesco e o link de volta. */
export function CabecalhoInterno({ eyebrow, titulo, children }: { eyebrow: string; titulo: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="hero-section relative overflow-hidden px-6 pt-28 pb-16 text-center sm:px-16 sm:pt-40">
      <ArabescoTopo />
      <Link href="/" className="back-link absolute top-4 left-4 z-10 rounded-full border border-linha bg-papel/90 px-3.5 py-2 backdrop-blur-sm sm:top-6 sm:left-6"><ArrowLeft className="size-3.5" /> Convite</Link>
      <p className="eyebrow relative">{eyebrow}</p>
      <h1 className="names-small relative mt-6">{titulo}</h1>
      {children && <div className="relative">{children}</div>}
    </header>
  )
}

export function Rodape() {
  return (
    <footer className="border-t border-linha px-6 py-9 text-center">
      <Music className="mx-auto size-4 text-[#9eb1bf]" strokeWidth={1.3} />
      <p className="mt-3 font-serif text-sm italic text-[#778894]">Com amor, {casamento.noivos}</p>
    </footer>
  )
}
