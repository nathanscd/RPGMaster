import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'
import { useTheme } from '../context/ThemeContext'

export default function Dashboard() {
  const { characters, deleteCharacter } = useCharacters()
  const { theme, setTheme } = useTheme()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-white p-6 md:p-12 flex flex-col items-center transition-colors duration-500">
      
      {/* SELETOR DE TEMAS */}
      <div className="w-full max-w-6xl mb-8 flex gap-2 justify-center md:justify-start">
        {(['mystery', 'medieval', 'scifi'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all ${
              theme === t 
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-[0_0_15px_var(--accent-glow)]' 
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* HEADER */}
      <div className="w-full max-w-6xl mb-12 flex justify-between items-end border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Meus <span className="text-[var(--accent)]">{theme === 'medieval' ? 'Aliados' : 'Agentes'}</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2 font-bold uppercase tracking-widest italic">
            {theme === 'mystery' && "Protocolo de Investigação Ativo"}
            {theme === 'medieval' && "Crônicas da Aliança"}
            {theme === 'scifi' && "Database de Tripulantes"}
          </p>
        </div>
        
        <Link 
          to="/create" 
          className="bg-[var(--accent)] hover:opacity-90 text-white px-6 py-3 rounded-lg font-black transition-all shadow-[0_0_20px_var(--accent-glow)] uppercase text-xs tracking-widest"
        >
          + Novo Registro
        </Link>
      </div>

      {/* GRID DE CARDS */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {characters.map(c => (
          <div key={c.id} className="group relative">
            <Link 
              to={`/sheet/${c.id}`}
              className="block h-full bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-2xl hover:border-[var(--accent)] transition-all overflow-hidden relative"
            >
              {/* Texto de Fundo Corrigido (z-0 e pointer-events-none) */}
              <div className="absolute -right-2 -top-2 text-7xl font-black text-white/[0.02] italic group-hover:text-[var(--accent-glow)] transition-colors z-0 pointer-events-none select-none">
                {c.classe?.substring(0, 3).toUpperCase()}
              </div>

              {/* Conteúdo (z-10 para ficar acima do texto de fundo) */}
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] opacity-80">
                    {c.origem || 'Operacional'}
                  </span>
                  
                  <h2 className="text-2xl font-black text-white mt-2 group-hover:text-[var(--accent)] transition-colors leading-tight">
                    {c.nome}
                  </h2>
                  
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                    {c.classe}
                  </p>
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-zinc-800/50 pt-6">
                  <div className="flex gap-4">
                     <div className="text-left">
                       <p className="text-[8px] text-zinc-600 uppercase font-black tracking-tighter">NEX</p>
                       <p className="text-sm font-black text-zinc-300">5%</p>
                     </div>
                     <div className="text-left">
                       <p className="text-[8px] text-zinc-600 uppercase font-black tracking-tighter">PV</p>
                       <p className="text-sm font-black text-red-600">{c.recursos?.vidaMaxima || 0}</p>
                     </div>
                  </div>

                  <div className="text-[10px] font-black text-[var(--accent)] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    ABRIR <span className="text-lg">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* BOTÃO DELETAR POSICIONADO FORA DO CONTEÚDO PRINCIPAL */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                setDeleteId(c.id);
              }}
              className="absolute top-4 right-4 z-30 p-2 bg-red-950/30 text-red-500 border border-red-900/30 rounded-lg hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
            >
              🗑️
            </button>
          </div>
        ))}

        {characters.length === 0 && (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-700 font-black uppercase tracking-[0.5em] text-sm">Sem registros encontrados</p>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO (ESTILO TEMA) */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-zinc-950 border border-red-900/50 p-10 rounded-3xl max-w-sm w-full text-center shadow-[0_0_80px_rgba(220,38,38,0.2)] animate-in zoom-in-95 duration-300">
            <div className="text-4xl mb-6">⚠️</div>
            <h2 className="text-2xl font-black uppercase text-white mb-3 tracking-tighter">Confirmar Exclusão?</h2>
            <p className="text-zinc-500 text-xs mb-10 uppercase tracking-widest leading-relaxed">O arquivo do agente será permanentemente deletado da base de dados.</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={async () => {
                  await deleteCharacter(deleteId)
                  setDeleteId(null)
                }}
                className="w-full py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase text-xs tracking-[0.2em]"
              >
                Confirmar Deleção
              </button>
              <button 
                onClick={() => setDeleteId(null)}
                className="w-full py-4 bg-transparent text-zinc-600 font-bold rounded-xl hover:text-zinc-400 transition-colors uppercase text-[10px] tracking-widest"
              >
                Abortar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}