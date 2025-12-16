import { useState } from 'react'

export default function FreeDiceRoller() {
  const [quantidade, setQuantidade] = useState(1)
  const [dado, setDado] = useState(20)
  const [bonus, setBonus] = useState(0)
  const [resultados, setResultados] = useState<number[]>([])

  function rolar() {
    const rolls = Array.from({ length: quantidade }, () =>
      Math.floor(Math.random() * dado) + 1
    )
    setResultados(rolls)
  }

  const total =
    resultados.reduce((a, b) => a + b, 0) + bonus

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          type="number"
          min={1}
          value={quantidade}
          onChange={e => setQuantidade(+e.target.value)}
          className="w-16 bg-zinc-900 p-1 rounded"
        />

        <span>d</span>

        <div className="flex gap-1">
          {[4, 6, 8, 10, 12, 20, 100].map(d => (
            <button
              key={d}
              onClick={() => setDado(d)}
              className={`px-2 py-1 rounded text-sm ${
                dado === d
                  ? 'bg-blue-600'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              d{d}
            </button>
          ))}
        </div>

        <span>+</span>

        <input
          type="number"
          value={bonus}
          onChange={e => setBonus(+e.target.value)}
          className="w-16 bg-zinc-900 p-1 rounded"
        />

        <button
          onClick={rolar}
          className="bg-blue-600 px-3 rounded"
        >
          Rolar
        </button>
      </div>

      {resultados.length > 0 && (
        <div className="text-sm text-zinc-300">
          Dados: {resultados.join(', ')}
          <br />
          Total: {total}
        </div>
      )}
    </div>
  )
}
