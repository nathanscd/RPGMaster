import { useState } from 'react'
import { DiceExpression } from '../types/Character'

type Props = {
  label: string
  roll: DiceExpression
}

export default function DiceRoller({ label, roll }: Props) {
  const [results, setResults] = useState<number[]>([])

  function rollDice() {
    const rolls = Array.from(
      { length: roll.quantidade },
      () => Math.floor(Math.random() * roll.dado) + 1
    )
    setResults(rolls)
  }

  const total =
    results.reduce((acc, v) => acc + v, 0) + (roll.modificador ?? 0)

  return (
    <div className="bg-zinc-800 p-3 rounded space-y-1">
      <div className="flex justify-between items-center">
        <span>
          {label} – {roll.quantidade}d{roll.dado}
          {roll.modificador ? ` + ${roll.modificador}` : ''}
        </span>

        <button
          onClick={rollDice}
          className="bg-blue-600 px-2 py-1 rounded text-sm btnn"
        >
          ROLAR
        </button>
      </div>

      {results.length > 0 && (
        <div className="text-sm text-zinc-300">
          Dados: {results.join(', ')} | Total: {total}
        </div>
      )}
    </div>
  )
}
