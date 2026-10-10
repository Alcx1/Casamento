// Tudo o que é "informação do casamento" fica aqui, para editar em um só lugar.

export const casamento = {
  noivos: 'Aurea & Alec',
  data: '27.12.2026',
  // Data e hora exatas da cerimônia (horário de Fortaleza, UTC-3) — usada na contagem regressiva
  dataHora: '2026-12-27T16:00:00-03:00',
  prazoConfirmacao: '20 de outubro',

  // WhatsApp dos noivos (só números, com DDI 55 + DDD) para quem não encontrar o nome na lista
  contatoWhatsApp: '5585985645776',

  // Coloque o arquivo da música em /public/musica/alianca.mp3
  musica: '/musica/alianca.mp3',

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
    chavePix: '00020101021126840014br.gov.bcb.pix013653b798e4-b553-4962-95bb-33bd42a392160222Casamento Aurea e Alec5204000053039865802BR5912Emanuel Alec6009Sao Paulo62070503***6304875A',
    titular: 'Emanuel Alec',
    banco: 'Revolut',
  },
}

// Os dois espaços de foto da seção "Momentos que guardamos"
export const slotsDeFoto = [
  { id: 'foto-1', label: 'Foto do casal' },
  { id: 'foto-2', label: 'Nosso momento' },
] as const

export const PASTA_FOTOS = 'momentos'
export const BUCKET_FOTOS = 'fotos'
