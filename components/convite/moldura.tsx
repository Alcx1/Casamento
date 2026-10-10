import Link from 'next/link'
import { ArrowLeft, Music } from 'lucide-react'
import { casamento } from '@/lib/casamento'

export function ArabescoTopo() {
  return (
    <>
      {/* Deixa o fundo branco do PNG transparente e pinta as linhas com o azul da paleta (#4a6290) */}
      <svg aria-hidden="true" className="absolute size-0">
        <filter id="arabesco-tinta" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0.29  0 0 0 0 0.384  0 0 0 0 0.565  -0.85 -0.85 -0.85 0 2.55" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </svg>
      <img
        src="/arabesco.png"
        alt=""
        aria-hidden="true"
        className="arabesco pointer-events-none absolute left-1/2 -top-2 h-auto w-full max-w-none -translate-x-1/2 select-none opacity-90 sm:-top-10"
      />
    </>
  )
}

/** O mesmo arabesco, espelhado na parte de baixo. Use junto com o ArabescoTopo (que define o filtro de cor). */
export function ArabescoRodape() {
  return (
    <img
      src="/arabesco.png"
      alt=""
      aria-hidden="true"
      className="arabesco pointer-events-none absolute left-1/2 -bottom-2 h-auto w-full max-w-none -translate-x-1/2 scale-y-[-1] select-none opacity-90 sm:-bottom-10"
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
      <div className={`invitation-shell mx-auto overflow-hidden bg-papel shadow-[0_18px_70px_rgba(31,40,64,0.12)] ${larga ? 'max-w-[1040px]' : 'max-w-[760px]'}`}>
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
      <Music className="mx-auto size-4 text-icone" strokeWidth={1.3} />
      <p className="mt-3 font-serif text-sm italic text-suave">Com amor, {casamento.noivos}</p>
    </footer>
  )
}
