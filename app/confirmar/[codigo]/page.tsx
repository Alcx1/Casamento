import type { Metadata } from 'next'
import { CabecalhoInterno, Moldura, Rodape } from '@/components/convite/moldura'
import { BuscaPorNome } from '@/components/convite/busca-por-nome'
import { FormularioPresenca } from '@/components/convite/formulario-presenca'
import { casamento } from '@/lib/casamento'
import { buscarConvite } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Confirme sua presença — Aurea & Alec',
  robots: { index: false },
}

export default async function ConfirmarConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const convite = await buscarConvite(decodeURIComponent(codigo))

  return (
    <Moldura>
      <CabecalhoInterno eyebrow="Confirme sua presença" titulo="Você vem?">
        {convite ? (
          <p className="quote mx-auto mt-8 max-w-md">
            Querido(s) <span className="not-italic font-medium text-azul">{convite.nome}</span>, será uma alegria ter vocês conosco.
          </p>
        ) : (
          <p className="quote mx-auto mt-8 max-w-md">Digite seu nome para encontrarmos o seu convite.</p>
        )}
      </CabecalhoInterno>

      <section className="section-padding border-t border-linha bg-nevoa text-center">
        <div className="paper-card mx-auto max-w-md">
          {convite ? <FormularioPresenca convite={convite} /> : <BuscaPorNome />}
        </div>
        <p className="small-caps mt-8">Confirme até dia {casamento.prazoConfirmacao}</p>
      </section>

      <Rodape />
    </Moldura>
  )
}
