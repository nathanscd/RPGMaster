import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'
import { useState } from 'react'
import Section from '../components/Section'
import NumericField from '../components/NumericField'
import { Character } from '../types/Character'
import DiceRoller from '../components/DiceRoller'
import FreeDiceRoller from '../components/FreeDiceRoller'

export default function SheetView() {
  const { id } = useParams()
  const { characters, updateCharacter } = useCharacters()
  const character = characters.find(c => c.id === id)
  const [damage, setDamage] = useState(0)

  if (!character) {
    return <div className="p-6">Personagem não encontrado</div>
  }

  const update = (fn: (c: Character) => Character) => {
    updateCharacter(character.id, fn)
  }

  function removeItem(itemId: string) {
    updateCharacter(id!, c => {
      const updatedInventario = c.inventario.filter(item => item.id !== itemId)

      return {
        ...c,
        inventario: updatedInventario
      }
    })
  }

  const pesoTotal = character.inventario.reduce(
    (total, item) => total + item.peso,
    0
  )

  return (
    <div className="viewport">
      <div className="char">
        <div className="Player">
          <h1>{character.nome}</h1>
        </div>

        <Section title="Recursos Vitais">
          {Object.entries(character.recursos).map(([k, v]) => (
            <NumericField
              key={k}
              label={k}
              value={v}
              onChange={val =>
                update(c => ({
                  ...c,
                  recursos: { ...c.recursos, [k]: val }
                }))
              }
            />
          ))}

          <div className="flex gap-2 mt-2">
            <input
              type="number"
              value={damage}
              onChange={e => setDamage(Number(e.target.value))}
              className="bg-zinc-900 p-1 rounded w-24"
            />
            <button
              onClick={() =>
                update(c => ({
                  ...c,
                  recursos: {
                    ...c.recursos,
                    vidaAtual: Math.max(
                      0,
                      c.recursos.vidaAtual - damage
                    )
                  }
                }))
              }
              className="bg-red-600 px-3 rounded"
            >
              Dano Rápido
            </button>
          </div>
        </Section>

        <Section title="Atributos">
          {Object.entries(character.atributos).map(([k, v]) => (
            <NumericField
              key={k}
              label={k}
              value={v}
              onChange={val =>
                update(c => ({
                  ...c,
                  atributos: { ...c.atributos, [k]: val }
                }))
              }
            />
          ))}
        </Section>
      </div>

      <div className="various">
        <Section title="Rolagem Livre">
          <FreeDiceRoller />
        </Section>

        <Section title="Defesa">
          {Object.entries(character.defesa).map(([k, v]) => (
            <NumericField
              key={k}
              label={k}
              value={v}
              onChange={val =>
                update(c => ({
                  ...c,
                  defesa: { ...c.defesa, [k]: val }
                }))
              }
            />
          ))}
        </Section>

        <Section title="Perícias">
          {Object.entries(character.pericias).map(([k, v]) => (
            <NumericField
              key={k}
              label={k}
              value={v}
              onChange={val =>
                update(c => ({
                  ...c,
                  pericias: { ...c.pericias, [k]: val }
                }))
              }
            />
          ))}
        </Section>

        <Section title="Habilidades">
          <div className="flex flex-col gap-2">
            {character.habilidades.map((hab, i) => (
              <DiceRoller
                key={i}
                label={hab.nome}
                roll={hab.roll}
              />
            ))}
          </div>
        </Section>

        <Section title="Armas">
          <div className="flex flex-col gap-2">
            {character.armas.map((arma, i) => (
              <DiceRoller
                key={i}
                label={arma.nome}
                roll={arma.roll}
              />
            ))}
          </div>
        </Section>

        <Section title="Inventário">
          <div className="space-y-2">
            {character.inventario.map((item, i) => (
              <div
                key={i}
                className="item"
              >
                <div>
                  <span>{item.nome}</span>
                  <span className="ml-2 text-sm text-zinc-400">
                    Peso {item.peso}
                  </span>
                </div>

                <button
                  onClick={() =>
                    update(c => {
                      const novoInventario = c.inventario.filter(
                        (_, index) => index !== i
                      )

                      const novasArmas =
                        item.tipo === 'arma'
                          ? c.armas.filter(a => a.nome !== item.nome)
                          : c.armas

                      return {
                        ...c,
                        inventario: novoInventario,
                        armas: novasArmas
                      }
                    })
                  }
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remover
                </button>
              </div>
            ))}

            <div className="text-sm text-zinc-400">
              Peso total: {pesoTotal} / {character.inventarioMaxPeso}
            </div>

            {pesoTotal >= character.inventarioMaxPeso && (
              <div className="text-red-500 text-sm">
                Inventário cheio
              </div>
            )}

            <Link
              to={`/sheet/${character.id}/add-item`}
              className="bg-blue-600 px-3 py-1 rounded inline-block mt-2"
            >
              Adicionar Itens
            </Link>
          </div>
        </Section>
      </div>
    </div>
  )
}
