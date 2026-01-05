import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'
import { useAuth } from '../context/AuthContext'
import { useFirestoreUsers } from '../hooks/useFirestoreUsers'

const TEMPORADAS = ["O Ciclo das Cinzas", "Outros"]
const CLASSES = ['Combatente', 'Especialista', 'Ocultista']

function CustomSelect({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: string[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-3 text-white cursor-pointer flex justify-between items-center hover:border-[var(--accent)] transition-all"
      >
        <span className="font-bold uppercase tracking-widest text-sm truncate">{value}</span>
        <span className={`text-[var(--accent)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <>
          <div className="absolute z-50 w-full mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
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
  const { addCharacter } = useCharacters()
  const { user, loading: authLoading, isGm } = useAuth()
  const { users } = useFirestoreUsers()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState('')
  const [classe, setClasse] = useState(CLASSES[0])
  const [origem, setOrigem] = useState('')
  const [temporada, setTemporada] = useState(TEMPORADAS[0])
  const [selectedOwner, setSelectedOwner] = useState('') 
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (authLoading || !user) {
      return alert('Aguarde o carregamento do perfil ou faça login novamente.')
    }

    if (!nome.trim()) return alert('O nome do agente é obrigatório')
    
    setLoading(true)

    try {
      let fotoUrl = 'https://i.imgur.com/ae2e562.png'

      if (imageFile) {
        fotoUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
              const canvas = document.createElement('canvas')
              const MAX_WIDTH = 300
              const scaleSize = MAX_WIDTH / img.width
              canvas.width = MAX_WIDTH
              canvas.height = img.height * scaleSize
              const ctx = canvas.getContext('2d')
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
              resolve(canvas.toDataURL('image/png', 0.4))
            }
            img.src = event.target?.result as string
          }
          reader.readAsDataURL(imageFile)
        })
      }

      let finalOwnerId = user.uid
      let finalOwnerName = user.displayName || 'Anônimo'

      if (isGm && selectedOwner) {
         const targetUser = users.find(u => u.uid === selectedOwner)
         if (targetUser) {
             finalOwnerId = targetUser.uid
             finalOwnerName = targetUser.displayName || 'Anônimo'
         }
      }

      const newCharacter = {
        nome,
        classe,
        origem: origem || 'Desconhecida',
        foto: fotoUrl,
        ownerId: finalOwnerId,
        ownerName: finalOwnerName,
        temporada: isGm ? temporada : TEMPORADAS[0],
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
        pericias: {}
      }

      await addCharacter(newCharacter)
      navigate('/')
    } catch (error) {
      console.error(error)
      alert('Erro ao processar os dados do agente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-2xl shadow-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Recrutar <span className="text-[var(--accent)]">Agente</span>
          </h1>
          <div className="h-1 w-12 bg-[var(--accent)] mt-1" />
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Nome do Agente</label>
            <input 
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-3 text-white focus:border-[var(--accent)] outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Classe de Operação</label>
            <CustomSelect value={classe} onChange={setClasse} options={CLASSES} />
          </div>

          {isGm && (
             <div>
                <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Temporada (Mestre)</label>
                <CustomSelect value={temporada} onChange={setTemporada} options={TEMPORADAS} />
             </div>
          )}

          {isGm && (
             <div>
                <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Atribuir a Jogador (Mestre)</label>
                <select 
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-3 text-white focus:border-[var(--accent)] outline-none font-bold text-sm uppercase"
                >
                    <option value="">Para mim (Mestre)</option>
                    {users.filter(u => u.uid !== user?.uid).map(u => (
                        <option key={u.uid} value={u.uid}>{u.displayName}</option>
                    ))}
                </select>
             </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Origem / Passado</label>
            <input 
              type="text"
              value={origem}
              onChange={e => setOrigem(e.target.value)}
              placeholder="Ex: Acadêmico"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-3 text-white focus:border-[var(--accent)] outline-none placeholder:text-zinc-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-[0.2em]">Foto do Token (Opcional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[var(--bg-input)] border border-dashed border-[var(--border-color)] rounded-lg p-4 text-center cursor-pointer hover:border-[var(--accent)] transition-all"
            >
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                {imageFile ? imageFile.name : 'Clique para selecionar imagem'}
              </span>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Link to="/" className="flex-1 text-center py-3 border border-[var(--border-color)] rounded-lg font-black text-xs text-zinc-500 uppercase tracking-widest">Abortar</Link>
            <button 
              type="submit"
              disabled={loading || authLoading}
              className="flex-1 bg-[var(--accent)] hover:opacity-80 disabled:opacity-50 text-white py-3 rounded-lg font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_25px_var(--accent-glow)] transition-all"
            >
              {loading ? 'Enviando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}