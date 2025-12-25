import { useParams, Link } from 'react-router-dom'
import { useCharacters } from '../context/CharacterContext'
import { useAuth } from '../context/AuthContext'
import { useState, useRef } from 'react'
import Section from '../components/Section'
import ResourceBar from '../components/ResourceBar'
import NumericField from '../components/NumericField'
import { Character } from '../types/Character'
import DiceRoller from '../components/DiceRoller'
import FreeDiceRoller from '../components/FreeDiceRoller'

const LISTA_PERICIAS = [
  "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", "Ciências", "Crime", "Diplomacia", 
  "Enganação", "Fortitude", "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação", 
  "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem", "Pontaria", "Prestigidigitação", 
  "Profissão", "Reflexos", "Religião", "Sobrevivência", "Tática", "Tecnologia", "Vontade"
]

function PericiasModal({ character, update, onClose }: any) {
  const togglePericia = (name: string) => {
    const current = character.pericias || {}
    if (current[name] !== undefined) {
      const { [name]: _, ...rest } = current
      update((c: any) => ({ ...c, pericias: rest }))
    } else {
      update((c: any) => ({ ...c, pericias: { ...current, [name]: 0 } }))
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-black uppercase tracking-widest italic text-sm">Gerenciar Perícias</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-2 custom-scrollbar">
          {LISTA_PERICIAS.map(p => {
            const has = character.pericias && character.pericias[p] !== undefined
            return (
              <button key={p} onClick={() => togglePericia(p)} className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all text-left ${has ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                {has ? '✅ ' : '+ '} {p}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SheetView() {
  const { id } = useParams()
  const { characters, updateCharacter } = useCharacters()
  const { user, isGm, loading: authLoading } = useAuth()
  
  const [isEditingMax, setIsEditingMax] = useState(false)
  const [damageValue, setDamageValue] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [showPericiasModal, setShowPericiasModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const character = characters.find(c => c.id === id)

  if (authLoading) return <div className="p-6 text-zinc-500 text-center">Carregando...</div>
  if (!character) return <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4"><h2>Personagem não encontrado</h2><Link to="/" className="text-indigo-400 border border-indigo-900 px-4 py-2 rounded">Voltar</Link></div>

  const canView = isGm || character.ownerId === user?.uid
  if (!canView) return <div className="min-h-screen bg-zinc-950 text-red-500 flex items-center justify-center font-bold">ACESSO NEGADO</div>

  const update = async (fn: (c: Character) => Character) => {
    const updatedChar = fn(character)
    await updateCharacter(character.id, updatedChar)
  }

  const handleQuickDamage = () => {
    if (damageValue <= 0) return
    update(c => ({ ...c, recursos: { ...c.recursos, vidaAtual: Math.max(0, c.recursos.vidaAtual - damageValue) } }))
    setDamageValue(0)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL('image/png')
        await updateCharacter(character.id, { foto: base64 })
        setUploading(false)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveItem = (index: number, item: any) => {
    update(c => {
      const newInv = [...(c.inventario || [])]
      newInv.splice(index, 1)

      let newArmas = [...(c.armas || [])]
      if (item.tipo === 'arma') {
        newArmas = newArmas.filter(arma => arma.nome !== item.nome)
      }

      return { ...c, inventario: newInv, armas: newArmas }
    })
  }

  const inventario = character.inventario || []
  const pesoTotal = inventario.reduce((total: number, item: any) => total + (item.peso || 0), 0)

  return (
    <div className="viewport">
      <div className="char">
        <div className="flex gap-4 mb-8">
          <Link to="/" className="border border-zinc-800 hover:border-indigo-500 text-zinc-500 hover:text-white px-6 py-2 rounded-lg font-bold transition-all uppercase text-[10px] tracking-widest">⬅ Voltar</Link>
          <Link to="/map" className="border border-zinc-800 hover:border-indigo-500 text-zinc-500 hover:text-white px-6 py-2 rounded-lg font-bold transition-all uppercase text-[10px] tracking-widest">🗺️ Mapa</Link>
        </div>

        <div className="Player border-zinc-800 pb-4 mb-2 flex items-center gap-6">
          <div className="relative w-24 rounded-2xl overflow-hidden cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <img src={character.foto || 'https://i.imgur.com/ae2e562.png'} className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-30' : 'group-hover:opacity-50'}`} />
            {uploading ? <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">...</div> : <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-[10px] font-bold uppercase">Trocar</div>}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic text-white leading-tight">{character.nome}</h1>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">
              <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{character.classe}</span>
              <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{character.origem}</span>
            </div>
          </div>
        </div>

        <Section title="Recursos Vitais">
          <div className="flex justify-end mb-2">
            <button onClick={() => setIsEditingMax(!isEditingMax)} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-colors">
              {isEditingMax ? '🔒 Bloquear' : '✏️ Editar Máximos'}
            </button>
          </div>
          <ResourceBar label="Vida (PV)" color="bg-red-600" current={character.recursos.vidaAtual} max={character.recursos.vidaMaxima} isEditingMax={isEditingMax} onChangeCurrent={(val) => update(c => ({ ...c, recursos: { ...c.recursos, vidaAtual: val } }))} onChangeMax={(val) => update(c => ({ ...c, recursos: { ...c.recursos, vidaMaxima: val } }))} />
          <div className="flex gap-2 mb-6 items-center bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
            <input type="number" placeholder="Dano" value={damageValue === 0 ? '' : damageValue} onChange={e => setDamageValue(Number(e.target.value))} className="bg-black text-white w-full p-2 rounded-lg border border-zinc-800 outline-none text-sm font-bold pl-3" />
            <button onClick={handleQuickDamage} className="bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase">Dano</button>
          </div>
          <ResourceBar label="Sanidade (SAN)" color="bg-indigo-600" current={character.recursos.sanidadeAtual} max={character.recursos.sanidadeMaxima} isEditingMax={isEditingMax} onChangeCurrent={(val) => update(c => ({ ...c, recursos: { ...c.recursos, sanidadeAtual: val } }))} onChangeMax={(val) => update(c => ({ ...c, recursos: { ...c.recursos, sanidadeMaxima: val } }))} />
          <ResourceBar label="Esforço (PE)" color="bg-yellow-500" current={character.recursos.peAtual || 0} max={character.recursos.peMaximo || 0} isEditingMax={isEditingMax} onChangeCurrent={(val) => update(c => ({ ...c, recursos: { ...c.recursos, peAtual: val } }))} onChangeMax={(val) => update(c => ({ ...c, recursos: { ...c.recursos, peMaximo: val } }))} />
        </Section>

        <Section title="Atributos">
          <div className="grid grid-cols-5 gap-2 text-center">
            {Object.entries(character.atributos || {}).map(([k, v]) => (
              <div key={k} className="flex flex-col items-center bg-zinc-900/30 p-2 rounded-xl border border-zinc-800 group relative">
                <span className="text-zinc-500 text-[10px] uppercase font-black mb-1">{k}</span>
                <input type="number" value={v as number} onChange={(e) => update(c => ({ ...c, atributos: { ...c.atributos, [k]: Number(e.target.value) } }))} className="bg-transparent text-2xl font-black text-white w-full text-center outline-none border-none p-0" />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Defesa & Perícias">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <NumericField label="Defesa Passiva" value={character.defesa?.passiva ?? 0} onChange={(val) => update(c => ({ ...c, defesa: { ...(c.defesa || {passiva:0, pontos:0}), passiva: val } }))} />
              <NumericField label="Bônus de Defesa" value={character.defesa?.pontos ?? 0} onChange={(val) => update(c => ({ ...c, defesa: { ...(c.defesa || {passiva:0, pontos:0}), pontos: val } }))} />
            </div>
            <div className="h-px bg-zinc-800 my-2" />
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Perícias Treinadas</h2>
              {isGm && <button onClick={() => setShowPericiasModal(true)} className="bg-indigo-900/30 border border-indigo-500/50 text-indigo-400 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase transition-all hover:bg-indigo-600 hover:text-white">+ Gerenciar</button>}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {Object.entries(character.pericias || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl group">
                  <span className="text-[10px] font-black uppercase text-zinc-400">{k}</span>
                  {isGm ? <NumericField label="" value={v as number} onChange={(val) => update(c => ({ ...c, pericias: { ...(c.pericias || {}), [k]: val } }))} /> : <span className="text-indigo-400 font-black text-sm">+{v}</span>}
                </div>
              ))}
              {Object.keys(character.pericias || {}).length === 0 && <p className="text-[10px] text-zinc-700 italic text-center py-4 uppercase">Nenhuma perícia selecionada</p>}
            </div>
          </div>
        </Section>
      </div>

      <div className="various space-y-4">
        <Section title="Rolagem Livre"><FreeDiceRoller /></Section>
        <Section title="Habilidades">
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {(character.habilidades || []).map((hab, i) => hab.roll && <DiceRoller key={i} label={hab.nome} roll={hab.roll} />)}
            {(!character.habilidades || character.habilidades.length === 0) && <span className="text-zinc-600 text-xs italic uppercase">Vazio...</span>}
          </div>
        </Section>
        <Section title="Armas">
          <div className="grid grid-cols-1 gap-2">
            {(character.armas || []).map((arma, i) => <DiceRoller key={i} label={arma.nome} roll={arma.roll} />)}
            {(!character.armas || character.armas.length === 0) && <span className="text-zinc-600 text-[10px] italic text-center py-4 uppercase">Desarmado</span>}
          </div>
        </Section>
        <Section title="Inventário">
          <div className="space-y-2">
            {inventario.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3"><span className="text-xs font-bold text-zinc-200 uppercase">{item.nome}</span><span className="text-[9px] text-zinc-500 bg-black px-2 py-0.5 rounded-lg border border-zinc-800">Carga {item.peso}</span></div>
                <button onClick={() => handleRemoveItem(i, item)} className="text-zinc-700 hover:text-red-500 transition-colors p-1">✕</button>
              </div>
            ))}
            <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 mt-4 pt-4 border-t border-zinc-900">
              <span>Carga Total</span>
              <span className={pesoTotal > (character.inventarioMaxPeso || 5) ? "text-red-500" : "text-white"}>{pesoTotal} / {character.inventarioMaxPeso || 5}</span>
            </div>
            <Link to="/add-item" state={{ characterId: character.id }} className="flex justify-center items-center w-full bg-zinc-900/30 hover:bg-zinc-800 py-3 rounded-xl text-[10px] font-black uppercase text-zinc-500 mt-4 border border-zinc-800 border-dashed transition-all">+ Novo Item</Link>
          </div>
        </Section>
      </div>
      {showPericiasModal && <PericiasModal character={character} update={update} onClose={() => setShowPericiasModal(false)} />}
    </div>
  )
}