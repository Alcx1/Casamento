// Tudo o que é "informação do casamento" fica aqui, para editar em um só lugar.

export const casamento = {
  noivos: 'Aurea & Alec',
  data: '27.12.2026',
  prazoConfirmacao: '20 de outubro',

  igreja: {
    nome: 'Cripta da Catedral de Fortaleza',
    endereco: 'Av. Alberto Nepomuceno · Centro',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Catedral+Metropolitana+de+Fortaleza',
  },

  buffet: {
    nome: "Buffet Viv'Á",
    endereco: 'Rua General Piragibe, 797 · Parquelândia',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Rua+General+Piragibe+797+Parquelandia+Fortaleza',
  },

  presentes: {
    // Coloque a imagem do QR Code em /public/pix-qrcode.png
    qrCode: '/pix-qrcode.png',
    chavePix: 'sua-chave-pix@exemplo.com',
    titular: 'Nome do titular da conta',
    banco: 'Banco',
    sugestoes: [
      { titulo: 'Café da manhã na lua de mel', valor: 'R$ 80' },
      { titulo: 'Jantar romântico', valor: 'R$ 150' },
      { titulo: 'Passeio a dois', valor: 'R$ 250' },
      { titulo: 'Diária no hotel', valor: 'R$ 400' },
      { titulo: 'Nosso primeiro sofá', valor: 'R$ 600' },
      { titulo: 'Passagens da lua de mel', valor: 'R$ 1.000' },
    ],
  },
}

// Os dois espaços de foto da seção "Momentos que guardamos"
export const slotsDeFoto = [
  { id: 'foto-1', label: 'Foto do casal' },
  { id: 'foto-2', label: 'Nosso momento' },
] as const

export const PASTA_FOTOS = 'momentos'
export const BUCKET_FOTOS = 'fotos'
