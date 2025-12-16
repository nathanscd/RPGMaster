type Props = {
  label: string
  value: number
  onChange: (value: number) => void
}

export default function NumericField({ label, value, onChange }: Props) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="bg-zinc-800 p-1 rounded w-24"
      />
    </div>
  )
}
