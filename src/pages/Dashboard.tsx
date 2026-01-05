import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCharacters } from '../context/CharacterContext'
import { updateProfile } from 'firebase/auth'

const TEMPORADAS = ["O Ciclo das Cinzas", "Outros"]

export default function Dashboard() {
  const { user, logout, isGm } = useAuth()
  const { characters, removeCharacter } = useCharacters()
  
  const [temporadaAtual, setTemporadaAtual] = useState(TEMPORADAS[0])
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(user?.displayName || '')

  const filteredCharacters = characters.filter(char => 
    char.temporada === temporadaAtual || (!char.temporada && temporadaAtual === "Outros")
  )

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      await updateProfile(user, { displayName: newName })
      setIsEditing(false)
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Deseja deletar a ficha de ${name}?`)) {
      await removeCharacter(id)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans select-none pb-20">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6 max-w-4xl mx-auto">
        <div>
           <h1 className="text-3xl font-black uppercase italic tracking-tighter">RPG<span className="text-indigo-500">Master</span></h1>
           <p className="text-zinc-500 text-sm">Painel de Controle</p>
        </div>
        <button onClick={logout} className="text-xs font-bold text-red-500 border border-red-900/30 bg-red-950/10 px-4 py-2 rounded-lg hover:bg-red-900/20 transition-all">SAIR</button>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-6 shadow-xl">
           <img src={user?.photoURL || 'https://i.imgur.com/ae2e562.png'} className="w-20 h-20 rounded-full border-2 border-indigo-500 object-cover shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
           <div className="flex-1">
              {isEditing ? (
                  <div className="flex gap-2">
                      <input value={newName} onChange={e => setNewName(e.target.value)} className="bg-zinc-950 border border-zinc-700 p-2 rounded text-white outline-none focus:border-indigo-500" />
                      <button onClick={handleUpdateProfile} className="bg-green-600 px-3 rounded font-bold hover:bg-green-500">OK</button>
                      <button onClick={() => setIsEditing(false)} className="bg-zinc-700 px-3 rounded font-bold hover:bg-zinc-600">X</button>
                  </div>
              ) : (
                  <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">Seja bem-vindo, <span className="text-indigo-400">{user?.displayName || 'Viajante'}</span>!</h2>
                      <button onClick={() => setIsEditing(true)} className="text-zinc-500 hover:text-white text-xs">✏️</button>
                  </div>
              )}
              <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
              <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded ${isGm ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                 {isGm ? '🛡️ MESTRE DA MESA' : '👤 JOGADOR'}
              </span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/rules" className="p-6 bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/30 hover:border-indigo-500 rounded-2xl transition-all group">
              <h3 className="text-xl font-black uppercase text-indigo-400 group-hover:text-white mb-2">📖 Livro de Regras</h3>
              <p className="text-zinc-500 text-sm">Entre no livro de regras para explorar o sistema.</p>
            </Link>
            <Link to="/map" className="p-6 bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/30 hover:border-indigo-500 rounded-2xl transition-all group">
              <h3 className="text-xl font-black uppercase text-indigo-400 group-hover:text-white mb-2">🗺️ Acessar Mapa</h3>
              <p className="text-zinc-500 text-sm">Entre no VTT para mover tokens e explorar.</p>
            </Link>
            <Link to="/create" className="p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl transition-all group">
              <h3 className="text-xl font-black uppercase text-zinc-300 group-hover:text-white mb-2">📝 Criar Personagem</h3>
              <p className="text-zinc-500 text-sm">Crie uma nova ficha de agente.</p>
            </Link>
        </div>

        <div className="pt-8 border-t border-zinc-800">
            <h3 className="text-zinc-400 font-black uppercase text-xs mb-6 tracking-[0.2em]">Fichas Disponíveis</h3>
            
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {TEMPORADAS.map(temp => (
                <button
                  key={temp}
                  onClick={() => setTemporadaAtual(temp)}
                  className={`px-4 py-3 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all border ${
                    temporadaAtual === temp 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCharacters.length > 0 ? (
                    filteredCharacters.map(char => {
                        const isMine = char.ownerId === user?.uid
                        return (
                            <Link key={char.id} to={`/sheet/${char.id}`} className={`relative flex items-center gap-4 bg-zinc-900 border p-4 rounded-xl transition-all group overflow-hidden ${isMine ? 'border-zinc-800 hover:border-indigo-500 hover:bg-zinc-800' : 'border-indigo-900/30 bg-indigo-900/10 hover:border-indigo-500/50'}`}>
                                <div className="w-10 overflow-hidden shrink-0 rounded-lg">
                                    <img src={char.foto || 'https://i.imgur.com/ae2e562.png'} className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white uppercase truncate group-hover:text-indigo-400 transition-colors">{char.nome}</h4>
                                        {(isMine || isGm) && (
                                            <button onClick={(e) => handleDelete(e, char.id, char.nome)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all text-xs">🗑️</button>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 truncate mb-1">{char.classe} • {char.origem}</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Criado por:</span>
                                        <span className={`text-[10px] font-bold truncate ${isMine ? 'text-green-500' : 'text-indigo-400'}`}>{isMine ? 'Você' : (char.ownerName || 'Desconhecido')}</span>
                                    </div>
                                </div>
                                {!isMine && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />}
                            </Link>
                        )
                    })
                ) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
                        <p className="text-zinc-600 font-bold uppercase text-xs">Nenhum agente encontrado nesta temporada</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}