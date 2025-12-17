import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

// Componente Interno para o Select Customizado
function CustomSelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const options = ['Combatente', 'Especialista', 'Ocultista']

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-all"
      >
        <span className="font-bold uppercase tracking-widest text-sm">{value}</span>
        <span className={`text-blue-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <>
          <div className="absolute z-50 w-full mt-2 bg-zinc-950 border border-blue-900/50 rounded-lg overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
            {options.map(opt => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
                className={`p-3 cursor-pointer transition-colors font-bold text-xs uppercase tracking-[0.2em]
                  ${value === opt ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:bg-blue-900/30 hover:text-white'}
                `}
              >
                {opt}
              </div>
            ))}
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  )
}

export default function CreateAgent() {
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const [nome, setNome] = useState('')
  const [classe, setClasse] = useState('Combatente')
  const [origem, setOrigem] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return alert('O nome do agente é obrigatório')

    const newCharacter = {
      nome,
      classe,
      origem,
      atributos: { For: 1, Agi: 1, Int: 1, Vig: 1, Pre: 1 },
      recursos: { 
        vidaAtual: 20, vidaMaxima: 20, 
        peAtual: 2, peMaximo: 2, 
        sanidadeAtual: 20, sanidadeMaxima: 20 
      },
      inventario: [],
      habilidades: [],
      armas: [],
      inventarioMaxPeso: 5
    }

    try {
      await axios.post(`${API_BASE}/api/characters`, newCharacter)
      navigate('/')
    } catch (error) {
      console.error('Erro ao criar agente:', error)
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
        <header className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Recrutar <span className="text-blue-600">Agente</span>
          </h1>
          <div className="h-1 w-12 bg-blue-600 mt-1" />
          <p className="text-zinc-500 text-xs mt-3 uppercase tracking-widest font-bold">Iniciando protocolo de registro</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Nome do Agente</label>
            <input 
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700 font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Classe de Operação</label>
            <CustomSelect value={classe} onChange={setClasse} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Origem / Passado</label>
            <input 
              type="text"
              value={origem}
              onChange={e => setOrigem(e.target.value)}
              placeholder="Ex: Acadêmico"
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700 font-bold"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Link 
              to="/" 
              className="flex-1 text-center py-3 border border-zinc-800 rounded-lg font-black text-xs text-zinc-500 hover:bg-zinc-800 hover:text-white transition-all uppercase tracking-widest"
            >
              Abortar
            </Link>
            <button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_25px_rgba(37,99,235,0.2)] transition-all active:scale-95"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}