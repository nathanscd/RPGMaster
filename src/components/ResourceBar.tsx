type Props = {
  label: string
  current: number
  max: number
  color: string 
  isEditingMax: boolean
  onChangeCurrent: (val: number) => void
  onChangeMax: (val: number) => void
}

export default function ResourceBar({ 
  label, 
  current, 
  max, 
  color, 
  isEditingMax, 
  onChangeCurrent, 
  onChangeMax 
}: Props) {
  
  const percent = Math.min(100, Math.max(0, (current / max) * 100)) || 0

  return (
    <div className="mb-5">
      <div className="flex justify-between items-end mb-1">
        <span className="font-bold text-zinc-400 text-xs uppercase tracking-wider mb-1">{label}</span>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 rounded p-1 border border-zinc-800">
             <button 
              onClick={() => onChangeCurrent(current - 1)}
              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
            >
              -
            </button>
            
            <input 
              type="number" 
              value={current}
              onChange={e => onChangeCurrent(Number(e.target.value))}
              className="w-12 bg-transparent text-center text-xl font-black text-white outline-none !border-none focus:ring-0 shadow-none"
            />

            <button 
              onClick={() => onChangeCurrent(current + 1)}
              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-green-400 hover:bg-zinc-800 rounded transition-colors"
            >
              +
            </button>
          </div>
          
          <span className="text-zinc-600 text-lg font-light">/</span>

          {isEditingMax ? (
            <input 
              type="number" 
              value={max}
              onChange={e => onChangeMax(Number(e.target.value))}
              className="w-12 bg-zinc-800 text-center text-white rounded border border-zinc-600 outline-none focus:border-white"
            />
          ) : (
            <span className="text-zinc-500 font-bold text-lg w-8 text-center">{max}</span>
          )}
        </div>
      </div>

      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}