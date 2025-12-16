import { Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'

export default function Dashboard() {
  const { characters } = useCharacters()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Personagens</h1>
      {characters.map(c => (
        <div key={c.id} className="bg-zinc-800 p-4 rounded flex justify-between">
          <div>
            <div className="font-semibold">{c.nome}</div>
            <div className="text-sm text-zinc-400">{c.classe}</div>
          </div>
          <Link to={`/sheet/${c.id}`} className="text-blue-400">
            Abrir Ficha
          </Link>
        </div>
      ))}
    </div>
  )
}
