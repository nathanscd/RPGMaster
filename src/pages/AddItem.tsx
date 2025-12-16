import { useParams, Link } from 'react-router-dom'
import { ITEMS } from '../data/items'
import { useCharacters } from '../context/CharacterContext'
import { Character } from '../types/Character'

export default function AddItem() {
  const { id } = useParams<{ id: string }>()
  const { characters, updateCharacter } = useCharacters()

  const character = characters.find(c => c.id === id)

  if (!character) {
    return <div className="p-6">Personagem não encontrado</div>
  }

  const pesoAtual = character.inventario.reduce(
    (total, item) => total + item.peso,
    0
  )

  function addItem(item: (typeof ITEMS)[number]) {
    updateCharacter(id!, (c: Character) => {
      const jaExiste = c.inventario.some(i => i.id === item.id)
      if (jaExiste) {
        alert('Você já possui este item no inventário')
        return c
      }

      const pesoNovo =
        c.inventario.reduce((t, i) => t + i.peso, 0) + item.peso

      if (pesoNovo > c.inventarioMaxPeso) {
        alert('Inventário cheio')
        return c
      }

      const novoInventario = [...c.inventario, item]

      const novasArmas =
        item.tipo === 'arma' && item.roll
          ? [...c.armas, { nome: item.nome, roll: item.roll }]
          : c.armas

      return {
        ...c,
        inventario: novoInventario,
        armas: novasArmas
      }
    })
  }

  return (
    <div className="additem">
      <h1 className="text-xl font-bold">
        Adicionar itens para {character.nome}
      </h1>

      <div className="text-sm text-zinc-400">
        Peso atual: {pesoAtual} / {character.inventarioMaxPeso}
      </div>

      {ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => addItem(item)}
          className="block w-full bg-zinc-800 p-3 rounded text-left hover:bg-zinc-700"
        >
          {item.nome} — Peso {item.peso}
        </button>
      ))}

      <Link
        to={`/sheet/${character.id}`}
        className="btn_add"
      >
        Voltar para ficha
      </Link>
    </div>
  )
}
