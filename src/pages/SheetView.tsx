import { useParams, Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'
import { useState } from 'react'
import Section from '../components/Section'
import ResourceBar from '../components/ResourceBar'
import NumericField from '../components/NumericField'
import { Character } from '../types/Character'
import DiceRoller from '../components/DiceRoller'
import FreeDiceRoller from '../components/FreeDiceRoller'

export default function SheetView() {
  const { id } = useParams()
  const { characters, updateCharacter } = useCharacters()
  const [isEditingMax, setIsEditingMax] = useState(false)
  
  const [damageValue, setDamageValue] = useState(0)

  const character = characters.find(c => c.id === id || (c as any)._id === id)

  if (!character) {
    return <div className="p-6 text-white">Personagem não encontrado</div>
  }

  const update = (fn: (c: Character) => Character) => {
    updateCharacter(character.id, fn)
  }

  const handleQuickDamage = () => {
    if (damageValue <= 0) return
    
    update(c => ({
      ...c,
      recursos: {
        ...c.recursos,
        vidaAtual: Math.max(0, c.recursos.vidaAtual - damageValue)
      }
    }))
    setDamageValue(0)
  }

  const inventario = character.inventario || []
  const pesoTotal = inventario.reduce((total, item) => total + (item.peso || 0), 0)

  const handleRemoveItem = (indexToRemove: number, item: any) => {
    update(charState => {
      const newInv = [...(charState.inventario || [])]
      newInv.splice(indexToRemove, 1)

      let newWeapons = [...(charState.armas || [])]
      if (item.tipo === 'arma') {
        const weaponIndex = newWeapons.findIndex(w => w.nome === item.nome)
        if (weaponIndex !== -1) newWeapons.splice(weaponIndex, 1)
      }

      return { ...charState, inventario: newInv, armas: newWeapons }
    })
  }

  return (
    <div className="viewport">
      <div className="char">
          <Link 
            to="/" 
            className="border border-zinc-800 hover:border-[var(--accent)] text-zinc-500 hover:text-white px-6 py-2 rounded-lg font-bold transition-all uppercase text-xs"
          >
            ⬅ Voltar
          </Link>
        <div className="flex gap-4 mb-5 mt-5">
          <Link 
            to="/map" 
            className="border border-zinc-800 hover:border-[var(--accent)] text-zinc-500 hover:text-white px-6 py-2 rounded-lg font-bold transition-all uppercase text-xs"
          >
            🗺️ Mapa
          </Link>

          <Link 
            to="/rules" 
            className="border border-zinc-800 hover:border-[var(--accent)] text-zinc-500 hover:text-white px-6 py-2 rounded-lg font-bold transition-all uppercase text-xs"
          >
            Livro de Regras
          </Link>
        </div>
        <div className="Player border-zinc-800 pb-4 mb-2 ml-5">
          <h1 className="text-3xl font-bold text-white leading-tight">{character.nome}</h1>
          <div className="flex flex-wrap gap-2 text-zinc-400 mt-2 text-xs uppercase tracking-wider">
             <span className="bg-zinc-900 px-2 py-1 rounded">{character.classe}</span>
             <span className="bg-zinc-900 px-2 py-1 rounded">{character.origem}</span>
          </div>
        </div>

        <Section title="Recursos Vitais">
          <div className="flex justify-end mb-2">
            <button 
              onClick={() => setIsEditingMax(!isEditingMax)}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              {isEditingMax ? '🔒 Bloquear' : '✏️ Editar Máximos'}
            </button>
          </div>

          {character.recursos && (
            <>
              <ResourceBar 
                label="Vida (PV)"
                color="bg-red-600"
                current={character.recursos.vidaAtual}
                max={character.recursos.vidaMaxima}
                isEditingMax={isEditingMax}
                onChangeCurrent={(val) => update(c => ({ ...c, recursos: { ...c.recursos, vidaAtual: val } }))}
                onChangeMax={(val) => update(c => ({ ...c, recursos: { ...c.recursos, vidaMaxima: val } }))}
              />

              <div className="flex gap-2 mb-6 items-center bg-zinc-900 p-2 rounded border border-zinc-800">
                <input 
                  type="number" 
                  placeholder="Dano"
                  value={damageValue === 0 ? '' : damageValue}
                  onChange={e => setDamageValue(Number(e.target.value))}
                  className="bg-black text-white w-full p-1 rounded border border-zinc-700 outline-none pl-2"
                />
                <button 
                  onClick={handleQuickDamage}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded text-xs font-bold transition-colors "
                >
                  TOMAR DANO
                </button>
              </div>

              <ResourceBar 
                label="Sanidade (SAN)"
                color="bg-blue-600"
                current={character.recursos.sanidadeAtual}
                max={character.recursos.sanidadeMaxima}
                isEditingMax={isEditingMax}
                onChangeCurrent={(val) => update(c => ({ ...c, recursos: { ...c.recursos, sanidadeAtual: val } }))}
                onChangeMax={(val) => update(c => ({ ...c, recursos: { ...c.recursos, sanidadeMaxima: val } }))}
              />

              <ResourceBar 
                label="Esforço (PE)"
                color="bg-yellow-500"
                current={character.recursos.peAtual}
                max={character.recursos.peMaximo}
                isEditingMax={isEditingMax}
                onChangeCurrent={(val) => update(c => ({ ...c, recursos: { ...c.recursos, peAtual: val } }))}
                onChangeMax={(val) => update(c => ({ ...c, recursos: { ...c.recursos, peMaximo: val } }))}
              />
            </>
          )}
        </Section>

        <Section title="Atributos">
          <div className="grid grid-cols-5 gap-2 text-center">
            {character.atributos && Object.entries(character.atributos).map(([k, v]) => (
              <div 
                key={k} 
                className="flex flex-col items-center bg-zinc-900 p-2 rounded border border-zinc-800 hover:border-zinc-600 transition-colors group"
              >
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                  {k}
                </span>
                
                <input 
                  type="number" 
                  value={v as number}
                  onChange={(e) => update(c => ({ ...c, atributos: { ...c.atributos, [k]: Number(e.target.value) } }))}
                  className="bg-transparent text-2xl font-black text-white w-full text-center outline-none !border-none focus:ring-0 shadow-none p-0"
                />

                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={() => update(c => ({ ...c, atributos: { ...c.atributos, [k]: (v as number) - 1 } }))}
                    className="w-5 h-5 flex items-center justify-center bg-zinc-950 text-zinc-500 hover:text-white rounded text-xs"
                   >
                     -
                   </button>
                   <button 
                    onClick={() => update(c => ({ ...c, atributos: { ...c.atributos, [k]: (v as number) + 1 } }))}
                    className="w-5 h-5 flex items-center justify-center bg-zinc-950 text-zinc-500 hover:text-white rounded text-xs"
                   >
                     +
                   </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Defesa">
           <div className="space-y-1">
             {character.defesa && Object.entries(character.defesa).map(([k, v]) => (
               <NumericField 
                 key={k} 
                 label={`Defesa (${k})`} 
                 value={v as number}
                 onChange={(val) => update(c => ({ ...c, defesa: { ...c.defesa, [k]: val } }))}
               />
             ))}
             <div className="h-px bg-zinc-800 my-2"></div>
             <h2 className="text-xl font-bold text-blue">Perícias</h2>
             {character.pericias && Object.entries(character.pericias).map(([k, v]) => (
               <NumericField 
                 key={k} 
                 label={k} 
                 value={v as number}
                 onChange={(val) => update(c => ({ ...c, pericias: { ...c.pericias, [k]: val } }))}
               />
             ))}
           </div>
        </Section>
      </div>

      <div className="various">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Dados Livres">
            <FreeDiceRoller />
          </Section>

        <Section title="Habilidades">
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
            {(character.habilidades || []).map((hab, i) => (
              hab.roll && <DiceRoller key={i} label={hab.nome} roll={hab.roll} />
            ))}
            {character.habilidades?.length === 0 && (
              <span className="text-zinc-600 text-sm italic">Nenhuma habilidade...</span>
            )}
          </div>
        </Section>
        </div>

        <Section title="Armas">
          <div className="grid grid-cols-1 gap-2">
            {(character.armas || []).map((arma, i) => (
              <DiceRoller key={i} label={arma.nome} roll={arma.roll} />
            ))}
            {character.armas?.length === 0 && <span className="text-zinc-600 text-sm italic">Desarmado</span>}
          </div>
        </Section>

        <Section title="Inventário">
          <div className="space-y-2">
            {inventario.map((item, i) => (
              <div key={i} className="item flex justify-between items-center bg-zinc-900 p-3 rounded border border-zinc-800">
                <div className="flex items-center gap-3">
                   <span className="text-white font-medium">{item.nome}</span>
                   <span className="text-[10px] text-zinc-500 bg-black px-2 py-0.5 rounded border border-zinc-800">Peso {item.peso}</span>
                </div>
                
                <button
                  onClick={() => handleRemoveItem(i, item)}
                  className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                  title="Remover"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <div className="flex justify-between text-sm text-zinc-500 mt-4 pt-2 border-t border-zinc-800">
              <span>Carga Total</span>
              <span className={pesoTotal > (character.inventarioMaxPeso || 0) ? "text-red-500 font-bold" : "text-white"}>
                 {pesoTotal} / {character.inventarioMaxPeso}
              </span>
            </div>

            <Link
              to={`/sheet/${character.id}/add-item`}
              className="flex justify-center items-center w-full bg-zinc-900 hover:bg-zinc-800 py-3 rounded text-sm text-zinc-400 hover:text-white mt-2 transition-all border border-zinc-800 border-dashed"
            >
              + Adicionar Item
            </Link>
          </div>
        </Section>
      </div>
    </div>
  )
}