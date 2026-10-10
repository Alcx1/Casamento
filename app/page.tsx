import Link from 'next/link'
import { ArrowUpRight, Camera, Check, ChevronDown, ChevronRight, Church, Gift, Heart, MapPin, UtensilsCrossed } from 'lucide-react'
import { Abertura } from '@/components/convite/abertura'
import { ContagemRegressiva } from '@/components/convite/contagem-regressiva'
import { ArabescoTopo, Moldura, OrnamentalDivider, Rodape } from '@/components/convite/moldura'
import { casamento, slotsDeFoto } from '@/lib/casamento'
import { buscarConvite, buscarFotos } from '@/lib/supabase'

function FotoCasal({ src, label, className = '' }: { src?: string; label: string; className?: string }) {
  return (
    <div className={`photo-slot relative overflow-hidden ${className}`}>
      {src ? (
        <img src={src} alt={label} className="absolute inset-0 size-full object-cover" />
      ) : (
        <span className="flex flex-col items-center gap-3 text-acento">
          <span className="flex size-11 items-center justify-center icon-circle">
            <Camera aria-hidden="true" className="size-5" strokeWidth={1.4} />
          </span>
          <span className="font-sans text-[10px] uppercase tracking-[0.28em]">{label}</span>
        </span>
      )}
    </div>
  )
}

export default async function Page({ searchParams }: { searchParams: Promise<{ convite?: string }> }) {
  const { convite: codigo } = await searchParams
  const [fotos, convite] = await Promise.all([buscarFotos(), codigo ? buscarConvite(codigo) : null])
  const linkConfirmacao = convite ? `/confirmar/${convite.codigo}` : '/confirmar'

  return (
    <Moldura>
      <Abertura convidado={convite?.nome} />
      <header className="hero-section relative flex min-h-[760px] flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-20 text-center sm:min-h-[860px] sm:px-16 sm:pt-40">
        <ArabescoTopo />
        <p className="eyebrow relative">O nosso sim começa aqui</p>
        <div className="relative mt-10 mb-7 text-ornamento" aria-hidden="true"><Heart className="mx-auto size-5 fill-current" strokeWidth={1} /></div>
        <h1 className="names-display relative">Aurea <span>&amp;</span> Alec</h1>
        <p className="quote relative mt-10 sm:mt-14">“Ainda que eu falasse a língua dos homens e falasse a língua dos anjos, sem amor eu nada seria.”</p>
        <div className="relative mt-14 flex items-center gap-5 text-acento"><span className="h-px w-16 bg-borda" /><span className="font-sans text-[10px] uppercase tracking-[0.3em]">{casamento.data}</span><span className="h-px w-16 bg-borda" /></div>
        {convite && (
          <p className="relative mt-10 font-serif text-lg italic text-texto">
            Convite especial para <span className="not-italic font-medium text-azul">{convite.nome}</span>
          </p>
        )}
        <a href="#historia" className="absolute bottom-8 animate-bounce text-acento" aria-label="Rolar para ver mais"><ChevronDown className="size-5" /></a>
      </header>

      <section id="historia" className="section-padding border-t border-linha text-center">
        <p className="eyebrow">Com a bênção dos nossos pais</p>
        <div className="mx-auto mt-9 grid max-w-lg grid-cols-2 gap-8 font-sans text-[10px] uppercase tracking-[0.16em] text-texto sm:gap-20">
          <p>Ana Paula M. de O. Moreira<br /><span className="text-suave">Fco. Auricio S. Moreira</span></p>
          <p>Tatiana Pinheiro Oliveira<br /><span className="text-suave">Fco. Claudio Oliveira</span></p>
        </div>
        <OrnamentalDivider />
        <p className="mx-auto max-w-lg font-serif text-[21px] leading-relaxed text-texto">Duas histórias que se encontraram, dois corações que escolheram caminhar juntos.</p>
      </section>

      <section className="section-padding bg-nevoa text-center">
        <p className="eyebrow">Um pedacinho da nossa história</p>
        <h2 className="section-title mt-4">Momentos que guardamos</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6">
          {slotsDeFoto.map((slot, i) => (
            <FotoCasal key={slot.id} src={fotos[slot.id]} label={slot.label} className={`aspect-[4/5] ${i % 2 ? 'mt-10 sm:mt-16' : ''}`} />
          ))}
        </div>
      </section>

      <section className="section-padding text-center">
        <p className="eyebrow">Reserve esta data</p>
        <h2 className="date-display">27 de dezembro<br /><span>de 2026</span></h2>
        <p className="mt-5 font-sans text-xs uppercase tracking-[0.3em] text-texto">Domingo, às 16h</p>
        <OrnamentalDivider />
        <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="venue-card">
            <span className="icon-circle mx-auto size-12"><Church className="size-5" strokeWidth={1.3} /></span>
            <p className="eyebrow mt-5">Cerimônia</p>
            <p className="mt-3 font-serif text-[22px] leading-snug text-titulo">Cripta da Catedral<br />de Fortaleza</p>
            <span className="venue-rule" aria-hidden="true" />
            <p className="small-caps leading-relaxed !text-azul">{casamento.igreja.endereco}</p>
          </div>
          <div className="venue-card">
            <span className="icon-circle mx-auto size-12"><UtensilsCrossed className="size-5" strokeWidth={1.3} /></span>
            <p className="eyebrow mt-5">Recepção</p>
            <p className="mt-3 font-serif text-[22px] leading-snug text-titulo">Espaço {casamento.buffet.nome}</p>
            <p className="mt-2 font-serif text-[15px] italic leading-snug text-texto">Após a cerimônia, receberemos vocês para celebrar</p>
            <span className="venue-rule" aria-hidden="true" />
            <p className="small-caps leading-relaxed !text-azul">{casamento.buffet.endereco}</p>
          </div>
        </div>
      </section>

      <nav className="flex flex-col gap-3 bg-nevoa px-5 py-14 sm:px-20" aria-label="Links do convite">
        <a className="invite-link" href={casamento.igreja.mapa} target="_blank" rel="noreferrer">
          <span className="invite-icon"><Church /></span><span className="invite-label">Localização da igreja</span><ArrowUpRight className="invite-arrow" />
        </a>
        <a className="invite-link" href={casamento.buffet.mapa} target="_blank" rel="noreferrer">
          <span className="invite-icon"><MapPin /></span><span className="invite-label">Localização do buffet</span><ArrowUpRight className="invite-arrow" />
        </a>
        <Link className="invite-link" href="/presentes">
          <span className="invite-icon"><Gift /></span><span className="invite-label">Lista de presentes</span><ChevronRight className="invite-arrow" />
        </Link>
        <Link className="invite-link invite-link-dark" href={linkConfirmacao}>
          <span className="invite-icon"><Check /></span><span className="invite-label">Confirme sua presença</span><ChevronRight className="invite-arrow" />
        </Link>
      </nav>

      <section id="rsvp" className="section-padding bg-papel text-center">
        <p className="eyebrow">Esperamos você</p>
        <h2 className="section-title mt-4">Venha celebrar conosco</h2>
        <p className="lead mx-auto mt-4 max-w-sm">Sua presença vai tornar este dia ainda mais especial.</p>
        <Link href={linkConfirmacao} className="btn-primary mt-8">Confirmar presença <Check /></Link>
        <p className="small-caps mt-6">Confirmar presença até dia {casamento.prazoConfirmacao}</p>
      </section>

      <section className="section-padding border-t border-linha bg-nevoa text-center">
        <p className="eyebrow">Contagem regressiva</p>
        <h2 className="section-title mt-4">Falta pouco para o nosso sim</h2>
        <div className="mt-10"><ContagemRegressiva /></div>
        <p className="small-caps mt-8">27 de dezembro de 2026 · às 16h</p>
      </section>

      <Rodape />
    </Moldura>
  )
}
