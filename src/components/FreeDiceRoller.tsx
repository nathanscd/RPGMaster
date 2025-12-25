import { useState } from 'react'

export default function FreeDiceRoller() {
  const [quantidade, setQuantidade] = useState(1)
  const [bonus, setBonus] = useState(0)
  const [resultados, setResultados] = useState<number[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [selectedDie, setSelectedDie] = useState<number>(20)

  function dispararRolagem() {
    setIsRolling(true)
    setResultados([]) 

    setTimeout(() => {
      const rolls = Array.from({ length: Math.max(1, quantidade) }, () =>
        Math.floor(Math.random() * selectedDie) + 1
      )
      setResultados(rolls)
      setIsRolling(false)
    }, 600)
  }

  const total = resultados.reduce((a, b) => a + b, 0) + bonus

  return (
    <div className="flex flex-col gap-3">
      <style>{`
        @keyframes dice-shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-dice { animation: dice-shake 0.15s infinite; }
      `}</style>
      
      <div className="flex items-center justify-between bg-black p-2 rounded border border-blue-900/30">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">Qtd</span>
          <input
            type="number"
            min={1}
            value={quantidade}
            onChange={e => setQuantidade(Math.max(1, +e.target.value))}
            className="w-10 bg-zinc-900 text-center font-bold text-white border-none outline-none focus:ring-1 ring-blue-500 rounded"
          />
        </div>

        <span className="text-zinc-800">|</span>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">Mod</span>
          <input
            type="number"
            value={bonus}
            onChange={e => setBonus(+e.target.value)}
            className="w-10 bg-zinc-900 text-center font-bold text-white border-none outline-none focus:ring-1 ring-blue-500 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[4, 6, 8, 10, 12, 20, 100].map(d => (
          <button
            key={d}
            disabled={isRolling}
            onClick={() => setSelectedDie(d)}
            className={`
              flex items-center justify-center py-2 rounded border transition-all font-bold text-xs
              ${selectedDie === d
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}
            `}
          >
            d{d}
          </button>
        ))}
        
        <div className="flex gap-1">
          <button 
            onClick={dispararRolagem}
            disabled={isRolling}
            className="flex-1 bg-blue-900/40 border border-blue-700 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase"
          >
            {isRolling ? '...' : 'Rolar'}
          </button>
          <button 
            onClick={() => { setResultados([]); setIsRolling(false); }}
            className="w-8 bg-zinc-950 border border-zinc-800 text-zinc-600 rounded hover:text-red-500 transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      </div>

      {(isRolling || resultados.length > 0) && (
        <div className="bg-black border border-blue-900/50 p-3 rounded flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-wrap gap-2 justify-center min-h-[32px]">
             {isRolling ? (
               Array.from({ length: Math.min(quantidade, 12) }).map((_, i) => (
                 <div key={i} className="w-8 h-8 flex items-center justify-center rounded bg-blue-900/20 border border-blue-500/50 text-blue-400 animate-dice">
                   ?
                 </div>
               ))
             ) : (
               resultados.map((r, i) => (
                 <div 
                   key={i} 
                   className={`
                      w-8 h-8 flex items-center justify-center rounded font-black border text-sm
                      ${selectedDie && r === selectedDie ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 
                        r === 1 ? 'bg-red-950 text-red-400 border-red-900' :
                        'bg-zinc-900 text-zinc-300 border-zinc-800'}
                   `}
                 >
                   {r}
                 </div>
               ))
             )}
          </div>
          
          {!isRolling && (
            <div className="flex justify-between items-center border-t border-zinc-900 pt-2 px-1">
               <span className="text-zinc-500 text-[10px] uppercase font-bold">
                 {quantidade}d{selectedDie} {bonus >= 0 ? `+${bonus}` : bonus}
               </span>
               <span className="text-2xl font-black text-white">{total}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}