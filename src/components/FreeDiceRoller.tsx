import { useState } from 'react'

export default function FreeDiceRoller() {
  const [quantidade, setQuantidade] = useState(1)
  const [bonus, setBonus] = useState(0)
  const [resultados, setResultados] = useState<number[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [selectedDie, setSelectedDie] = useState<number>(20)
  
  const [isCustomQty, setIsCustomQty] = useState(false)

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

  const handleCustomQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (val > 50) {
      alert("São dados demais! O limite é 50.")
      setQuantidade(50)
    } else {
      setQuantidade(Math.max(1, val))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === 'custom') {
      setIsCustomQty(true)
      setQuantidade(1)
    } else {
      setIsCustomQty(false)
      setQuantidade(Number(val))
    }
  }

  const somaTotal = resultados.reduce((a, b) => a + b, 0) + bonus
  const maiorTotal = resultados.length > 0 ? Math.max(...resultados) + bonus : 0

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
          
          {isCustomQty ? (
            <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
              <input
                type="number"
                min={1}
                max={50}
                value={quantidade}
                onChange={handleCustomQtyChange}
                className="w-12 bg-zinc-900 text-center font-bold text-white border-none outline-none focus:ring-1 ring-blue-500 rounded py-1"
                autoFocus
              />
              <button 
                onClick={() => { setIsCustomQty(false); setQuantidade(1); }}
                className="text-zinc-500 hover:text-white text-xs px-1"
                title="Voltar para lista"
              >
                ↺
              </button>
            </div>
          ) : (
            <select
              value={quantidade}
              onChange={handleSelectChange}
              className="w-14 bg-zinc-900 text-center font-bold text-white border-none outline-none focus:ring-1 ring-blue-500 rounded appearance-none cursor-pointer py-1"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
              <option value="custom">Outro...</option>
            </select>
          )}
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
          <div className="flex flex-wrap gap-2 justify-center min-h-[32px] max-h-[200px] overflow-y-auto custom-scrollbar">
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
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-3">
               <div className="flex flex-col items-center justify-center">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Soma Total</span>
                  <div className="text-xl font-black text-white bg-zinc-900/50 px-4 py-1 rounded border border-zinc-800 w-full text-center">
                    {somaTotal}
                  </div>
               </div>
               <div className="flex flex-col items-center justify-center border-l border-zinc-900">
                  <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-1">Maior Dado</span>
                  <div className="text-xl font-black text-blue-400 bg-blue-900/20 px-4 py-1 rounded border border-blue-500/30 w-full text-center">
                    {maiorTotal}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}