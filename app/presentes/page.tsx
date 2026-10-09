import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Gift, Heart } from 'lucide-react'
import { CabecalhoInterno, Moldura, OrnamentalDivider, Rodape } from '@/components/convite/moldura'
import { CopiarPix } from '@/components/convite/copiar-pix'
import { QrCodePix } from '@/components/convite/qr-code'
import { casamento } from '@/lib/casamento'

export const metadata: Metadata = {
  title: 'Lista de presentes — Aurea & Alec',
  description: 'Presenteie os noivos via Pix.',
}

export default function PresentesPage() {
  const { presentes } = casamento

  return (
    <Moldura>
      <CabecalhoInterno eyebrow="Lista de presentes" titulo="Com carinho">
        <p className="quote mx-auto mt-8 max-w-md">
          Sua presença já é o nosso maior presente. Mas, se quiser nos abençoar com algo a mais, preparamos este cantinho com muito carinho.
        </p>
      </CabecalhoInterno>

      <section className="section-padding border-t border-linha bg-nevoa text-center">
        <p className="eyebrow">Presenteie via Pix</p>
        <h2 className="section-title mt-4">Aponte a câmera</h2>
        <p className="lead mx-auto mt-3 max-w-sm">Abra o app do seu banco, escolha pagar com Pix e escaneie o código abaixo.</p>

        <div className="paper-card mx-auto mt-10 max-w-md">
          <QrCodePix src={presentes.qrCode} />
          <OrnamentalDivider />
          <p className="small-caps">Ou use a chave Pix</p>
          <p className="mt-3 break-all font-serif text-xl text-titulo">{presentes.chavePix}</p>
          <p className="small-caps mt-3 leading-relaxed">{presentes.titular}<br />{presentes.banco}</p>
          <div className="mt-7"><CopiarPix chave={presentes.chavePix} /></div>
        </div>
      </section>

      <section className="section-padding text-center">
        <p className="eyebrow">Ideias para inspirar</p>
        <h2 className="section-title mt-4">Sonhos que vamos realizar</h2>
        <p className="lead mx-auto mt-3 max-w-md">São apenas sugestões — qualquer valor, de qualquer tamanho, será recebido com gratidão.</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {presentes.sugestoes.map((item) => (
            <li key={item.titulo} className="flex items-center gap-4 rounded-2xl border border-borda bg-white px-5 py-4 text-left transition-transform duration-200 hover:-translate-y-0.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-nevoa text-acento"><Gift className="size-4" strokeWidth={1.4} /></span>
              <span className="flex-1 font-serif text-lg leading-tight text-titulo">{item.titulo}</span>
              <span className="font-sans text-[11px] tracking-[0.12em] text-azul">{item.valor}</span>
            </li>
          ))}
        </ul>
        <OrnamentalDivider />
        <Heart className="mx-auto size-5 fill-current text-acento" strokeWidth={1} />
        <p className="quote mx-auto mt-4 max-w-sm">Obrigado por fazer parte da nossa história.</p>
        <Link href="/confirmar" className="btn-outline mt-8">Já confirmou presença? <Check /></Link>
      </section>

      <Rodape />
    </Moldura>
  )
}
