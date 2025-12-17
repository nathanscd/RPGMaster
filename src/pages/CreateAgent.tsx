import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function CreateAgent() {
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const [nome, setNome] = useState('')
  const [classe, setClasse] = useState('Combatente')
  const [origem, setOrigem] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return alert('O nome é obrigatório')

    const newCharacter = {
      nome,
      classe,
      origem,
      atributos: { For: 1, Agi: 1, Int: 1, Vig: 1, Pre: 1 },
      recursos: { vidaAtual: 20, vidaMaxima: 20, peAtual: 2, peMaximo: 2, sanidadeAtual: 20, sanidadeMaxima: 20 },
      inventario: [],
      habilidades: [],
      armas: [],
      inventarioMaxPeso: 5
    }

    try {
      await axios.post(`${API_BASE}/api/characters`, newCharacter)
      navigate('/')
    } catch (error) {
      console.error('Erro ao criar personagem:', error)
      alert('Erro ao conectar com o servidor')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
          Recrutar <span className="text-blue-600">Agente</span>
        </h1>
        <p className="text-zinc-500 text-sm mb-8 italic">Preencha os dados básicos do novo recruta.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">Nome do Personagem</label>
            <input 
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Arthur Cervero"
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">Classe</label>
            <select 
              value={classe}
              onChange={e => setClasse(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="Combatente">Combatente</option>
              <option value="Especialista">Especialista</option>
              <option value="Ocultista">Ocultista</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-500 mb-2 tracking-widest">Origem (Opcional)</label>
            <input 
              type="text"
              value={origem}
              onChange={e => setOrigem(e.target.value)}
              placeholder="Ex: Investigador"
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Link 
              to="/" 
              className="flex-1 text-center py-3 border border-zinc-800 rounded-lg font-bold text-zinc-500 hover:bg-zinc-800 transition-colors"
            >
              CANCELAR
            </Link>
            <button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
            >
              CRIAR
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}