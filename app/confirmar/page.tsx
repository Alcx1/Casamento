import type { Metadata } from 'next'
import { CabecalhoInterno, Moldura, Rodape } from '@/components/convite/moldura'
import { FormularioCodigo } from '@/components/convite/formulario-codigo'
import { casamento } from '@/lib/casamento'

export const metadata: Metadata = {
  title: 'Confirme sua presença — Aurea & Alec',
}

export default function ConfirmarPage() {
  return (
    <Moldura>
      <CabecalhoInterno eyebrow="Confirme sua presença" titulo="Você vem?">
        <p className="quote mx-auto mt-8 max-w-md">Cada convite tem um código único, enviado junto com o link pelos noivos.</p>
      </CabecalhoInterno>
      <section className="section-padding border-t border-linha bg-nevoa text-center">
        <div className="paper-card mx-auto max-w-md">
          <FormularioCodigo />
        </div>
        <p className="small-caps mt-8">Confirme até dia {casamento.prazoConfirmacao}</p>
      </section>
      <Rodape />
    </Moldura>
  )
}
