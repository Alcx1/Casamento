'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LogIn, LogOut } from 'lucide-react'
import { Moldura, OrnamentalDivider } from '@/components/convite/moldura'
import { PainelConvidados } from '@/components/admin/painel-convidados'
import { PainelFotos } from '@/components/admin/painel-fotos'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState<'convidados' | 'fotos'>('convidados')

  useEffect(() => {
    if (!supabase) return setCarregando(false)
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => setSessao(novaSessao))
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <Moldura larga>
      <header className="hero-section border-b border-linha px-6 py-12 text-center sm:px-12">
        <p className="eyebrow">Painel dos noivos</p>
        <h1 className="names-small mt-4">Aurea &amp; Alec</h1>
        {sessao && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" className={aba === 'convidados' ? 'btn-primary' : 'btn-outline'} onClick={() => setAba('convidados')}>Convidados</button>
            <button type="button" className={aba === 'fotos' ? 'btn-primary' : 'btn-outline'} onClick={() => setAba('fotos')}>Fotos</button>
            <button type="button" className="back-link ml-2" onClick={() => supabase?.auth.signOut()}><LogOut className="size-3.5" /> Sair</button>
          </div>
        )}
      </header>

      <div className="px-4 py-10 sm:px-12 sm:py-14">
        {!supabase ? (
          <AvisoConfiguracao />
        ) : carregando ? (
          <p className="small-caps text-center">Carregando…</p>
        ) : !sessao ? (
          <Login />
        ) : aba === 'convidados' ? (
          <PainelConvidados />
        ) : (
          <PainelFotos />
        )}
      </div>
    </Moldura>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  
  async function entrar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setErro('Supabase não configurado.');
      return;
    }

    setEnviando(true);
    setErro('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      if (!data.session) {
        setErro('Login realizado, mas nenhuma sessão foi criada.');
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao realizar login.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="paper-card mx-auto max-w-sm space-y-5">
      <div>
        <label htmlFor="email" className="field-label">E-mail</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="senha" className="field-label">Senha</label>
        <input id="senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="field-input" autoComplete="current-password" />
      </div>
      {erro && <p className="text-center font-sans text-xs text-[#9a5f5f]">{erro}</p>}
      <button type="submit" disabled={enviando} className="btn-primary w-full">{enviando ? 'Entrando…' : 'Entrar'} <LogIn /></button>
    </form>
  )
}

function AvisoConfiguracao() {
  return (
    <div className="paper-card mx-auto max-w-lg text-center">
      <h2 className="section-title">Supabase não configurado</h2>
      <OrnamentalDivider />
      <p className="lead">
        Crie o arquivo <code className="font-sans text-sm">.env.local</code> com <code className="font-sans text-sm">NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
        <code className="font-sans text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e reinicie o servidor.
      </p>
    </div>
  )
}
