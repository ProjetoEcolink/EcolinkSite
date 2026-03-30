import { useState, useEffect } from 'react'
import { auth } from '../../lib/supabase'
import './AuthSection.css'

export default function AuthSection() {
  const [modo, setModo] = useState('login')
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔥 LÊ O MODO DA URL (?modo=login ou ?modo=cadastro)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const modoUrl = params.get('modo')
    if (modoUrl === 'cadastro' || modoUrl === 'login') {
      setModo(modoUrl)
    }
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setErro('')
    setSucesso('')
    setLoading(true)
    try {
      if (modo === 'cadastro') {
        await auth.signUp(form.nome, form.email, form.senha)
        setSucesso('Cadastro realizado! Verifique seu e-mail.')
        setForm({ nome: '', email: '', senha: '' })
      } else {
        await auth.signIn(form.email, form.senha)
        setSucesso('Login realizado com sucesso! ✅')
      }
    } catch (error) {
      setErro(modo === 'login' ? 'E-mail ou senha incorretos.' : error.message)
    }
    setLoading(false)
  }

  return (
    <section id="auth" className="auth-section">
      <div className="auth-card">
        <h2 className="auth-logo">EcoLink</h2>
        <p className="auth-sub">Descarte consciente de lixo eletrônico</p>

        <div className="auth-abas">
          <button className={`auth-aba ${modo === 'login' ? 'ativa' : ''}`} onClick={() => setModo('login')}>
            Login
          </button>
          <button className={`auth-aba ${modo === 'cadastro' ? 'ativa' : ''}`} onClick={() => setModo('cadastro')}>
            Cadastro
          </button>
        </div>

        {modo === 'cadastro' && (
          <input className="auth-input" name="nome" placeholder="Seu nome" value={form.nome} onChange={handleChange} />
        )}

        <input className="auth-input" name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} />
        <input className="auth-input" name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} />

        {erro && <p className="auth-erro">{erro}</p>}
        {sucesso && <p className="auth-sucesso">{sucesso}</p>}

        <button className="auth-botao" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        <p className="auth-trocar">
          {modo === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <span onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}>
            {modo === 'login' ? 'Cadastre-se' : 'Faça login'}
          </span>
        </p>
      </div>
    </section>
  )
}