import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Section from '../components/Section'
import ResourceBar from '../components/ResourceBar'
import NumericField from '../components/NumericField'
import { Character } from '../types/Character'
import DiceRoller from '../components/DiceRoller'
import FreeDiceRoller from '../components/FreeDiceRoller'

export default function SheetView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { characters, updateCharacter } = useCharacters()
  const { user, isGm, loading: authLoading } = useAuth()
  
  const [isEditingMax, setIsEditingMax] = useState(false)
  const [damageValue, setDamageValue] = useState(0)

  // Busca o personagem na lista carregada (que já vem filtrada do hook se for player)
  const character = characters.find(c => c.id === id)

  // 1. Tela de Carregando (enquanto o Auth ou o Firebase não respondem)
  if (authLoading) {
     return <div className="p-6 text-zinc-500 text-center">Carregando grimório...</div>
  }

  // 2. Se não achou o personagem
  if (!character) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-bold">Personagem não encontrado</h2>
            <p className="text-zinc-500">Talvez ele tenha sido deletado ou você não tem permissão.</p>
            <Link to="/" className="text-indigo-400 border border-indigo-900 px-4 py-2 rounded hover:bg-indigo-900/50">
                Voltar ao Início
            </Link>
        </div>
    )
  }

  // 3. Verificação de Segurança (Redundância caso a lista não tenha filtrado)
  const canView = isGm || character.ownerId === user?.uid
  if (!canView) {
      return (
          <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
              <h1 className="text-red-500 font-bold text-2xl">⛔ ACESSO NEGADO</h1>
          </div>
      )
  }

  // Função helper para manter sua lógica original de (c => newC)
  // O Firebase updateCharacter espera (id, data), então calculamos o data aqui.
  const update = async (fn: (c: Character) => Character) => {
    const updatedChar = fn(character)
    await updateCharacter(character.id, updatedChar)
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
  const pesoTotal = inventario.reduce((total: number, item: any) => total + (item.peso || 0), 0)

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
    <div className="viewport pb-20"> {/* pb-20 para dar espaço no final em mobile */}
      <div className="char max-w-4xl mx-auto p-4">
        
        {/* Header de Navegação */}
        <div className="flex flex-wrap gap-2 mb-8">
            <Link 
                to="/" 
                className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500 text-zinc-400 hover:text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
                ⬅ Voltar
            </Link>
            
            {/* Botão Mapa (Visível para todos que acessam a ficha) */}
            <Link 
                to="/map" 
                className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500 text-zinc-400 hover:text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
                🗺️ Mapa
            </Link>

            <Link 
                to="/rules" 
                className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500 text-zinc-400 hover:text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
                📚 Regras
            </Link>
        </div>

        {/* Cabeçalho do Personagem */}
        <div className="flex items-center gap-6 mb-8 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black border-2 border-zinc-700 overflow-hidden shrink-0 shadow-lg">
                <img src={character.foto || 'https://i.imgur.com/ae2e562.png'} className="w-full h-full object-cover" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">{character.nome}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-indigo-900/30 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{character.classe}</span>
                    <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{character.origem}</span>
                </div>
            </div>
        </div>

        <Section title="Recursos Vitais">
          <div className="flex justify-end mb-2">
            <button 
              onClick={() => setIsEditingMax(!isEditingMax)}
              className="text-xs text-zinc-500 hover:text-white transition-colors bg-zinc-900 px-2 py-1 rounded border border-zinc-800"
            >
              {isEditingMax ? '🔒 Bloquear Máximos' : '✏️ Editar Máximos'}
            </button>
          </div>

          {character.recursos && (
            <div className="space-y-4">
              <ResourceBar 
                label="Vida (PV)"
                color="bg-red-600"
                current={character.recursos.vidaAtual}
                max={character.recursos.vidaMaxima}
                isEditingMax={isEditingMax}
                onChangeCurrent={(val) => update(c => ({ ...c, recursos: { ...c.recursos, vidaAtual: val } }))}
                onChangeMax={(val) => update(c => ({ ...c, recursos: { ...c.recursos, vidaMaxima: val } }))}
              />

              {/* Área de Dano Rápido */}
              <div className="flex gap-2 items-center bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                <input 
                  type="number" 
                  placeholder="Qtd Dano"
                  value={damageValue === 0 ? '' : damageValue}
                  onChange={e => setDamageValue(Number(e.target.value))}
                  className="bg-zinc-950 text-white w-full p-2 rounded border border-zinc-800 outline-none focus:border-red-900 transition-colors text-sm font-bold"
                />
                <button 
                  onClick={handleQuickDamage}
                  className="bg-red-900/20 hover:bg-red-600 border border-red-900/50 text-red-500 hover:text-white px-4 py-2 rounded text-xs font-black uppercase transition-all whitespace-nowrap"
                >
                  Tomar Dano
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    current={character.recursos.peAtual || 0}
                    max={character.recursos.peMaximo || 0}
                    isEditingMax={isEditingMax}
                    onChangeCurrent={(val) => update(c => ({ ...c, recursos: { ...c.recursos, peAtual: val } }))}
                    onChangeMax={(val) => update(c => ({ ...c, recursos: { ...c.recursos, peMaximo: val } }))}
                  />
              </div>
            </div>
          )}
        </Section>

        <Section title="Atributos">
          <div className="grid grid-cols-5 gap-2 md:gap-4 text-center">
            {character.atributos && Object.entries(character.atributos).map(([k, v]) => (
              <div 
                key={k} 
                className="flex flex-col items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 hover:border-indigo-500/50 transition-colors group relative"
              >
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                  {k}
                </span>
                
                <input 
                  type="number" 
                  value={v as number}
                  onChange={(e) => update(c => ({ ...c, atributos: { ...c.atributos, [k]: Number(e.target.value) } }))}
                  className="bg-transparent text-2xl md:text-3xl font-black text-white w-full text-center outline-none p-0 appearance-none"
                />

                {/* Controles Hover */}
                <div className="absolute -bottom-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-800 rounded-full px-1 shadow-xl">
                   <button 
                    onClick={() => update(c => ({ ...c, atributos: { ...c.atributos, [k]: (v as number) - 1 } }))}
                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white text-sm font-bold"
                   >-</button>
                   <div className="w-px h-6 bg-zinc-800"></div>
                   <button 
                    onClick={() => update(c => ({ ...c, atributos: { ...c.atributos, [k]: (v as number) + 1 } }))}
                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white text-sm font-bold"
                   >+</button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Defesa & Perícias">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <h3 className="text-xs font-black uppercase text-zinc-500 mb-2">Defesas</h3>
                 {character.defesa && Object.entries(character.defesa).map(([k, v]) => (
                   <NumericField 
                     key={k} 
                     label={k} 
                     value={v as number}
                     onChange={(val) => update(c => ({ ...c, defesa: {
                        ...(c.defesa || { passiva: 0, pontos: 0 }), 
                        [k]: val 
                    } }))}
                   />
                 ))}
               </div>
               
               <div className="space-y-2">
                 <h3 className="text-xs font-black uppercase text-blue-500 mb-2">Perícias</h3>
                 <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {character.pericias && Object.entries(character.pericias).map(([k, v]) => (
                        <NumericField 
                        key={k} 
                        label={k} 
                        value={v as number}
                        onChange={(val) => update(c => ({ ...c, pericias: { ...c.pericias, [k]: val } }))}
                        />
                    ))}
                 </div>
               </div>
           </div>
        </Section>

      <div className="various mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Dados Livres">
            <FreeDiceRoller />
          </Section>

        <Section title="Habilidades">
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
            {(character.habilidades || []).map((hab, i) => (
              hab.roll && <DiceRoller key={i} label={hab.nome} roll={hab.roll} />
            ))}
            {(!character.habilidades || character.habilidades.length === 0) && (
              <span className="text-zinc-600 text-sm italic text-center py-4">Nenhuma habilidade registrada.</span>
            )}
          </div>
        </Section>
        </div>

        <Section title="Armas">
          <div className="grid grid-cols-1 gap-2">
            {(character.armas || []).map((arma, i) => (
              <DiceRoller key={i} label={arma.nome} roll={arma.roll} />
            ))}
            {(!character.armas || character.armas.length === 0) && <span className="text-zinc-600 text-sm italic text-center py-4">Nenhuma arma equipada.</span>}
          </div>
        </Section>

        <Section title="Inventário">
          <div className="space-y-2">
            {inventario.map((item: any, i: number) => (
              <div key={i} className="item flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                   <span className="text-white font-medium">{item.nome}</span>
                   <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">Peso {item.peso}</span>
                </div>
                
                <button
                  onClick={() => handleRemoveItem(i, item)}
                  className="text-zinc-600 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-800"
                  title="Remover Item"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <div className="flex justify-between text-sm mt-4 pt-3 border-t border-zinc-800">
              <span className="text-zinc-500 font-bold uppercase text-xs">Carga Total</span>
              <span className={`font-black ${pesoTotal > (character.inventarioMaxPeso || 0) ? "text-red-500" : "text-green-500"}`}>
                 {pesoTotal} / {character.inventarioMaxPeso}
              </span>
            </div>

            {/* Link para Adicionar Item */}
            {/* Nota: Certifique-se de que a rota /add-item no App.tsx suporte receber ID via state ou mude a rota lá para /sheet/:id/add-item */}
            <Link
              to="/add-item" 
              state={{ characterId: character.id }} // Passamos o ID via state para a página AddItem
              className="flex justify-center items-center w-full bg-zinc-900 hover:bg-zinc-800 py-3 rounded-lg text-xs font-bold uppercase text-zinc-400 hover:text-white mt-4 transition-all border border-zinc-800 border-dashed hover:border-indigo-500"
            >
              + Adicionar Item
            </Link>
          </div>
        </Section>
      </div>
      </div>
    </div>
  )
}