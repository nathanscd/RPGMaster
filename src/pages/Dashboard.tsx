import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'

export default function Dashboard() {
  const { characters, deleteCharacter } = useCharacters()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-6xl mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Meus <span className="text-blue-600">Agentes</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Selecione uma ficha para iniciar a missão</p>
        </div>
        
        <Link 
          to="/create" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] uppercase text-xs"
        >
          + Novo Agente
        </Link>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map(c => (
          <div key={c.id} className="group relative">
            <Link 
              to={`/sheet/${c.id}`}
              className="block h-full bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 text-8xl font-black text-white/[0.03] italic group-hover:text-blue-500/10 transition-colors">
                {c.classe?.substring(0, 3)}
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
                  {c.origem || 'Agente'}
                </span>
                
                <h2 className="text-2xl font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">
                  {c.nome}
                </h2>
                
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest mt-1">
                  {c.classe}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-3">
                     <div className="text-center">
                       <p className="text-[9px] text-zinc-500 uppercase font-bold">NEX</p>
                       <p className="text-sm font-bold text-zinc-200">5%</p>
                     </div>
                     <div className="w-[1px] h-8 bg-zinc-800" />
                     <div className="text-center">
                       <p className="text-[9px] text-zinc-500 uppercase font-bold">Vida</p>
                       <p className="text-sm font-bold text-red-500">{c.recursos?.vidaMaxima || 0}</p>
                     </div>
                  </div>

                  <span className="text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform">
                    ACESSAR FICHA →
                  </span>
                </div>
              </div>
            </Link>

            {/* BOTÃO DELETAR */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                setDeleteId(c.id);
              }}
              className="absolute top-4 right-4 z-20 p-2 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg hover:bg-red-600 hover:text-white transition-all md:opacity-0 group-hover:opacity-100"
            >
              🗑️
            </button>
          </div>
        ))}

        {characters.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 font-bold uppercase tracking-widest">Nenhum agente recrutado</p>
          </div>
        )}
      </div>

      {/* POPUP DE CONFIRMAÇÃO */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-red-900/50 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.15)] animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-900/50">
              ⚠️
            </div>
            <h2 className="text-xl font-black uppercase text-white mb-2">Eliminar Agente?</h2>
            <p className="text-zinc-500 text-xs mb-8 uppercase tracking-widest font-bold">Esta ação é irreversível.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 bg-zinc-900 text-zinc-500 font-bold rounded-lg hover:bg-zinc-800 transition-colors uppercase text-[10px]"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  await deleteCharacter(deleteId)
                  setDeleteId(null)
                }}
                className="flex-1 py-3 bg-red-600 text-white font-black rounded-lg hover:bg-red-500 transition-all uppercase text-[10px]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}