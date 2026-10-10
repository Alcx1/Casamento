import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Heart, Home } from 'lucide-react'
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
  // Código "copia e cola" começa com 000201; chave comum (e-mail, CPF, telefone) não
  const copiaECola = presentes.chavePix.startsWith('000201')

  return (
    <Moldura>
      <CabecalhoInterno eyebrow="Lista de presentes" titulo="Com carinho">
        <p className="quote mx-auto mt-8 max-w-md">
          Sua presença já é o nosso maior presente. Mas, se quiser nos abençoar com algo a mais, preparamos este cantinho com muito carinho.
        </p>
      </CabecalhoInterno>

      <section id="pix" className="section-padding scroll-mt-4 border-t border-linha bg-nevoa text-center">
        <p className="eyebrow">Presenteie via Pix</p>
        <h2 className="section-title mt-4">Aponte a câmera</h2>
        <p className="lead mx-auto mt-3 max-w-sm">Abra o app do seu banco, escolha pagar com Pix e escaneie o código abaixo.</p>

        <div className="paper-card mx-auto mt-10 max-w-md">
          <QrCodePix src={presentes.qrCode} />
          <OrnamentalDivider />
          <p className="small-caps">{copiaECola ? 'Ou use o Pix copia e cola' : 'Ou use a chave Pix'}</p>
          <p className={`mt-3 break-all text-titulo ${copiaECola ? 'max-h-24 overflow-y-auto rounded-lg bg-nevoa px-3 py-2 font-sans text-[11px] leading-relaxed' : 'font-serif text-xl'}`}>{presentes.chavePix}</p>
          <p className="small-caps mt-3 leading-relaxed">{presentes.titular}<br />{presentes.banco}</p>
          <div className="mt-7"><CopiarPix chave={presentes.chavePix} copiaECola={copiaECola} /></div>
        </div>
      </section>

      <section className="section-padding text-center">
        <span className="icon-circle mx-auto size-12"><Home className="size-5" strokeWidth={1.4} /></span>
        <p className="eyebrow mt-6">Nosso novo lar</p>
        <h2 className="section-title mt-4">Ajude a montar nossa casa</h2>
        <p className="lead mx-auto mt-4 max-w-md">
          Estamos começando a montar o nosso primeiro cantinho juntos. Se quiser nos presentear, um Pix de qualquer valor vai nos ajudar a deixar a casa com a nossa cara.
        </p>
        <a href="#pix" className="btn-primary mt-10">Presentear pelo Pix <Heart className="fill-current" /></a>
        <OrnamentalDivider />
        <Heart className="mx-auto size-5 fill-current text-acento" strokeWidth={1} />
        <p className="quote mx-auto mt-4 max-w-sm">Obrigado por fazer parte da nossa história.</p>
        <Link href="/confirmar" className="btn-outline mt-8">Já confirmou presença? <Check /></Link>
      </section>

      <Rodape />
    </Moldura>
  )
}
