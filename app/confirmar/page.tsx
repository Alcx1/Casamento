import type { Metadata } from 'next'
import { CabecalhoInterno, Moldura, Rodape } from '@/components/convite/moldura'
import { BuscaPorNome } from '@/components/convite/busca-por-nome'
import { casamento } from '@/lib/casamento'

export const metadata: Metadata = {
  title: 'Confirme sua presença — Aurea & Alec',
}

export default function ConfirmarPage() {
  return (
    <Moldura>
      <CabecalhoInterno eyebrow="Confirme sua presença" titulo="Você vem?">
        <p className="quote mx-auto mt-8 max-w-md">Digite seu nome para encontrarmos o seu convite.</p>
      </CabecalhoInterno>
      <section className="section-padding border-t border-linha bg-nevoa text-center">
        <div className="paper-card mx-auto max-w-md">
          <BuscaPorNome />
        </div>
        <p className="small-caps mt-8">Confirme até dia {casamento.prazoConfirmacao}</p>
      </section>
      <Rodape />
    </Moldura>
  )
}
