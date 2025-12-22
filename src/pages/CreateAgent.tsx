import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext' // <--- Importamos o Contexto

function CustomSelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const options = ['Combatente', 'Especialista', 'Ocultista']

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-3 text-white cursor-pointer flex justify-between items-center hover:border-[var(--accent)] transition-all"
      >
        <span className="font-bold uppercase tracking-widest text-sm">{value}</span>
        <span className={`text-[var(--accent)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <>
          <div className="absolute z-50 w-full mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {options.map(opt => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
                className={`p-3 cursor-pointer transition-colors font-bold text-xs uppercase tracking-[0.2em]
                  ${value === opt ? 'bg-[var(--accent)] text-white' : 'text-zinc-500 hover:bg-[var(--accent-glow)] hover:text-white'}
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
  const { addCharacter } = useCharacters() // <--- Usamos a função do Firebase aqui

  const [nome, setNome] = useState('')
  const [classe, setClasse] = useState('Combatente')
  const [origem, setOrigem] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return alert('O nome do agente é obrigatório')
    
    setLoading(true)

    const newCharacter = {
      nome,
      classe,
      origem: origem || 'Desconhecida', // Garante que não vá vazio
      atributos: { For: 1, Agi: 1, Int: 1, Vig: 1, Pre: 1 },
      recursos: { 
        vidaAtual: 20, vidaMaxima: 20, 
        peAtual: 2, peMaximo: 2, 
        sanidadeAtual: 20, sanidadeMaxima: 20 
      },
      inventario: [],
      habilidades: [],
      armas: [],
      inventarioMaxPeso: 5,
      pericias: {} // Adicionei inicialização de perícias vazias
    }

    try {
      // Chama a função do Contexto que salva no Firestore
      await addCharacter(newCharacter)
      navigate('/')
    } catch (error) {
      console.error('Erro ao criar agente:', error)
      alert('Erro ao salvar no banco de dados.')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-white p-6 flex flex-col items-center justify-center transition-colors duration-500">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
        <header className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Recrutar <span className="text-[var(--accent)]">Agente</span>
          </h1>
          <div className="h-1 w-12 bg-[var(--accent)] mt-1" />
          <p className="text-zinc-500 text-xs mt-3 uppercase tracking-widest font-bold opacity-60">Iniciando protocolo de registro</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Nome do Agente</label>
            <input 
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-3 text-white focus:border-[var(--accent)] outline-none transition-all font-bold"
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
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-3 text-white focus:border-[var(--accent)] outline-none transition-all placeholder:text-zinc-800 font-bold"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Link 
              to="/" 
              className="flex-1 text-center py-3 border border-[var(--border-color)] rounded-lg font-black text-xs text-zinc-500 hover:bg-[var(--border-color)] hover:text-white transition-all uppercase tracking-widest"
            >
              Abortar
            </Link>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--accent)] hover:opacity-80 disabled:opacity-50 text-white py-3 rounded-lg font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_25px_var(--accent-glow)] transition-all active:scale-95"
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}