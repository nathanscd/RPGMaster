import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from 'firebase/auth'

export default function Dashboard() {
  const { user, logout, isGm } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(user?.displayName || '')

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      await updateProfile(user, { displayName: newName })
      setIsEditing(false)
      window.location.reload()
    } catch (error) {
      console.error("Erro ao atualizar perfil", error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans select-none">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
           <h1 className="text-3xl font-black uppercase italic tracking-tighter">RPG<span className="text-indigo-500">Master</span></h1>
           <p className="text-zinc-500 text-sm">Painel de Controle</p>
        </div>
        <button onClick={logout} className="text-xs font-bold text-red-500 border border-red-900/30 bg-red-950/10 px-4 py-2 rounded-lg hover:bg-red-900/20 transition-all">SAIR</button>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-6 shadow-xl">
           <div className="relative group cursor-pointer">
              <img src={user?.photoURL || 'https://i.imgur.com/ae2e562.png'} className="w-20 h-20 rounded-full border-2 border-indigo-500 object-cover shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
           </div>
           
           <div className="flex-1">
              {isEditing ? (
                  <div className="flex gap-2">
                      <input 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 p-2 rounded text-white outline-none focus:border-indigo-500"
                      />
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
           <Link to="/map" className="p-6 bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/30 hover:border-indigo-500 rounded-2xl transition-all group">
              <h3 className="text-xl font-black uppercase text-indigo-400 group-hover:text-white mb-2">🗺️ Acessar Mapa</h3>
              <p className="text-zinc-500 text-sm">Entre no VTT para mover tokens e explorar.</p>
           </Link>
           
           <Link to="/create" className="p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl transition-all group">
              <h3 className="text-xl font-black uppercase text-zinc-300 group-hover:text-white mb-2">📝 Criar Personagem</h3>
              <p className="text-zinc-500 text-sm">Crie uma nova ficha de agente.</p>
           </Link>
        </div>

      </div>
    </div>
  )
}