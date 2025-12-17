type Props = {
  label: string
  value: number
  onChange: (value: number) => void
}

export default function NumericField({ label, value, onChange }: Props) {
  return (
    <div className="flex justify-between items-center p-2 bg-zinc-900 rounded border border-zinc-800 hover:border-zinc-600 transition-colors group">
      <span className="text-zinc-500 font-bold text-xs uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
        {label}
      </span>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onChange(value - 1)}
          className="w-6 h-6 flex items-center justify-center bg-zinc-950 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded text-sm transition-colors"
          tabIndex={-1}
        >
          -
        </button>

        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="bg-transparent text-white font-bold text-lg text-center w-12 outline-none !border-none focus:ring-0 p-0 shadow-none"
        />

        <button 
          onClick={() => onChange(value + 1)}
          className="w-6 h-6 flex items-center justify-center bg-zinc-950 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded text-sm transition-colors"
          tabIndex={-1}
        >
          +
        </button>
      </div>
    </div>
  )
}