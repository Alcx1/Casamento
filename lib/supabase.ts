import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { BUCKET_FOTOS, PASTA_FOTOS, slotsDeFoto } from '@/lib/casamento'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fica null enquanto o .env.local não estiver configurado; o site continua funcionando sem fotos/RSVP.
export const supabase: SupabaseClient | null = url && chave ? createClient(url, chave) : null

export type Convite = {
  id: string
  codigo: string
  nome: string
  telefone: string | null
  max_pessoas: number
  nomes_convidados: string[]
  status: 'pendente' | 'confirmado' | 'recusado'
  pessoas_confirmadas: number
  nomes_confirmados: string[]
  mensagem: string | null
  respondido_em: string | null
  criado_em: string
}

export type ConvitePublico = Pick<
  Convite,
  'codigo' | 'nome' | 'max_pessoas' | 'status' | 'pessoas_confirmadas' | 'nomes_convidados' | 'nomes_confirmados' | 'mensagem'
>

export async function buscarConvite(codigo: string): Promise<ConvitePublico | null> {
  if (!supabase || !codigo) return null
  const { data } = await supabase.rpc('buscar_convite', { p_codigo: codigo })
  return (data as ConvitePublico[] | null)?.[0] ?? null
}

/** Procura o convite pelo nome de um dos convidados (exige nome e sobrenome). Pode haver homônimos. */
export async function buscarConvitePorNome(nome: string): Promise<ConvitePublico[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('buscar_convite_por_nome', { p_nome: nome })
  if (error) throw error
  return (data as ConvitePublico[] | null) ?? []
}

/** URLs públicas das fotos, por slot. O "?v=" evita que o navegador mostre a foto antiga após uma troca. */
export async function buscarFotos(): Promise<Record<string, string>> {
  if (!supabase) return {}
  const { data } = await supabase.storage.from(BUCKET_FOTOS).list(PASTA_FOTOS)
  const fotos: Record<string, string> = {}
  for (const slot of slotsDeFoto) {
    const arquivo = data?.find((item) => item.name === slot.id)
    if (!arquivo) continue
    const { data: publica } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(`${PASTA_FOTOS}/${slot.id}`)
    fotos[slot.id] = `${publica.publicUrl}?v=${encodeURIComponent(arquivo.updated_at ?? '')}`
  }
  return fotos
}
