import { Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'

export default function Dashboard() {
  const { characters } = useCharacters()

  return (
    <div className="main">
      <h1 className="text-2xl font-bold">Personagens</h1>
      <div className="profiles">
        {characters.map(c => (
          <div key={c.id} className="personagem">
            <div>
              <div className="font-semibold">{c.nome}</div>
              <div className="text-sm text-zinc-400">{c.classe}</div>
              <Link to={`/sheet/${c.id}`} className="text-blue-400">
                Abrir Ficha
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
