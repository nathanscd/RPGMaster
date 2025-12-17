import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useCharacters } from '../context/CharacterContext'
import { Character, InventoryItem } from '../types/Character'

export default function AddItem() {
  const { id } = useParams<{ id: string }>()
  const { characters, updateCharacter } = useCharacters()
  
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'item' | 'arma'>('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [customName, setCustomName] = useState('')
  const [customWeight, setCustomWeight] = useState(1)
  const [customObs, setCustomObs] = useState('')
  const [customType, setCustomType] = useState('Padrão')
  
  const [customDiceQtd, setCustomDiceQtd] = useState(1)
  const [customDiceFace, setCustomDiceFace] = useState(6)

  const character = characters.find(c => c.id === id || (c as any)._id === id)

  useEffect(() => {
    axios.get('http://localhost:3001/api/items')
      .then(response => {
        setAvailableItems(response.data)
      })
      .catch(err => console.error('Erro ao buscar itens:', err))
  }, [])

  if (!character) {
    return <div className="p-6 text-white">Personagem não encontrado</div>
  }

  const pesoAtual = (character.inventario || []).reduce((t, i) => t + i.peso, 0)
  const capacidade = character.inventarioMaxPeso || 1
  const percentPeso = Math.min(100, (pesoAtual / capacidade) * 100)

  function addItem(item: InventoryItem) {
    updateCharacter(character!.id, (c: Character) => {
      const jaExiste = !item.id.startsWith('custom-') && c.inventario?.some(i => i.id === item.id)
      if (jaExiste) return c

      const pesoNovo = (c.inventario || []).reduce((t, i) => t + i.peso, 0) + item.peso
      if (pesoNovo > (c.inventarioMaxPeso || 0)) {
        alert('Inventário cheio! Aumente sua força.')
        return c
      }

      const itemParaInventario = { ...item, instanceId: Date.now() }
      const novoInventario = [...(c.inventario || []), itemParaInventario]
      const isArma = item.tipo.toLowerCase() === 'arma'
      
      const novasArmas =
        isArma && item.roll
          ? [...(c.armas || []), { nome: item.nome, roll: item.roll }]
          : (c.armas || [])

      return { ...c, inventario: novoInventario, armas: novasArmas }
    })
  }

  function handleCreateCustom() {
    if (!customName.trim()) return alert('Dê um nome ao item')
    const tipoFinal = customType === 'Arma' ? 'arma' : 'item' 
    const newItem: InventoryItem = {
      id: `custom-${Date.now()}`,
      nome: customName,
      peso: customWeight,
      tipo: customType, 
      descricao: customObs
    }

    if (customType === 'Arma') {
      newItem.tipo = 'arma' 
      newItem.roll = {
        quantidade: customDiceQtd,
        dado: customDiceFace
      }
    } else {
      newItem.tipo = customType
    }

    addItem(newItem)
    
    setCustomName('')
    setCustomWeight(1)
    setCustomObs('')
    setCustomType('Padrão')
    setCustomDiceQtd(1)
    setIsModalOpen(false)
  }

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const tipoItem = item.tipo.toLowerCase()
    const matchesType = filterType === 'all' 
      || (filterType === 'arma' && tipoItem === 'arma')
      || (filterType === 'item' && tipoItem !== 'arma')
    
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider">
              Loja de <span className="text-blue-600">Suprimentos</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Personagem: <span className="text-white font-bold">{character.nome}</span>
            </p>
          </div>
          
          <Link
            to={`/sheet/${character.id}`}
            className="text-zinc-400 hover:text-white text-sm border-b border-zinc-600 hover:border-white transition-colors"
          >
            Voltar para Ficha
          </Link>
        </div>
        <div className="bg-zinc-900 w-full h-4 rounded-full overflow-hidden border border-zinc-800 relative group">
          <div 
            className={`h-full transition-all duration-500 ${percentPeso >= 100 ? 'bg-red-600' : 'bg-blue-600'}`}
            style={{ width: `${percentPeso}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white/80 drop-shadow-md">
            Carga: {pesoAtual} / {capacidade}
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 mb-8 sticky top-4 z-10 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-blue-900/30">
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 pl-10 rounded-lg focus:border-blue-500 outline-none"
          />
          <span className="absolute left-3 top-3.5 text-zinc-500">🔍</span>
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'arma', label: 'Armas' },
            { id: 'item', label: 'Itens' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterType(opt.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                filterType === opt.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex flex-col items-center justify-center min-h-[140px] border-2 border-dashed border-zinc-700 rounded-xl hover:border-blue-500 hover:bg-zinc-900/50 transition-all gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors text-xl text-white font-bold">
            +
          </div>
          <span className="text-zinc-400 group-hover:text-blue-400 font-bold text-sm">CRIAR MANUALMENTE</span>
        </button>

        {filteredItems.map(item => {
          const jaTem = character.inventario?.some(i => i.id === item.id)
          const isWeapon = item.tipo.toLowerCase() === 'arma'

          return (
            <button
              key={item.id}
              onClick={() => !jaTem && addItem(item)}
              disabled={jaTem}
              className={`
                relative flex flex-col text-left p-4 rounded-xl border transition-all duration-300 group overflow-hidden
                ${jaTem 
                  ? 'bg-zinc-950 border-zinc-800 opacity-60 cursor-not-allowed grayscale' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:-translate-y-1'}
              `}
            >
              <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase rounded-bl-lg ${
                isWeapon ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
              }`}>
                {item.tipo}
              </div>

              <div className="mb-2">
                <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {item.nome}
                </span>
                {isWeapon && item.roll && (
                  <span className="block text-xs text-zinc-500 font-mono mt-1">
                    Dano: {item.roll.quantidade}d{item.roll.dado}
                  </span>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-800 w-full flex justify-between items-center">
                 <div className="text-xs bg-black px-2 py-1 rounded text-zinc-400 border border-zinc-800">
                    Peso <strong>{item.peso}</strong>
                 </div>
                 
                 {jaTem ? (
                   <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                     ✓ POSSUI
                   </span>
                 ) : (
                   <span className="text-xs font-bold text-blue-500 group-hover:underline">
                     ADICIONAR +
                   </span>
                 )}
              </div>
            </button>
          )
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-blue-900/50 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(37,99,235,0.2)] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black mb-6 text-white text-center tracking-tight">
              NOVO ITEM <span className="text-blue-600">PERSONALIZADO</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Nome</label>
                <input 
                  type="text" 
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                  placeholder="Ex: Espada Longa"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Tipo</label>
                <select 
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none appearance-none"
                >
                  <option value="Padrão">Padrão</option>
                  <option value="Arma">Arma</option>
                  <option value="Comida">Comida</option>
                  <option value="Utilitário">Utilitário</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {customType === 'Arma' && (
                <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-900/30 space-y-3 animate-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-blue-400 uppercase text-center mb-2">Configuração de Dano</p>
                  <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="block text-[10px] text-zinc-500 mb-1">DADOS (QTD)</label>
                       <input 
                         type="number" min="1"
                         value={customDiceQtd}
                         onChange={e => setCustomDiceQtd(Number(e.target.value))}
                         className="w-full bg-black border border-zinc-700 rounded p-2 text-center font-bold text-white focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div className="flex items-end pb-2 font-bold text-zinc-600">d</div>
                    <div className="flex-1">
                       <label className="block text-[10px] text-zinc-500 mb-1">LADOS</label>
                       <select 
                         value={customDiceFace}
                         onChange={e => setCustomDiceFace(Number(e.target.value))}
                         className="w-full bg-black border border-zinc-700 rounded p-2 text-center font-bold text-white focus:border-blue-500 outline-none"
                       >
                         {[4, 6, 8, 10, 12, 20].map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>
                  </div>
                  <div className="text-center text-xs text-blue-200 font-mono">
                    Dano Final: <strong>{customDiceQtd}d{customDiceFace}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Peso</label>
                <div className="flex items-center gap-2">
                  <button 
                     onClick={() => setCustomWeight(Math.max(0, customWeight - 1))}
                     className="bg-zinc-800 w-10 h-10 rounded border border-zinc-700 hover:bg-zinc-700 font-bold"
                  >-</button>
                  <input 
                    type="number" 
                    value={customWeight}
                    onChange={e => setCustomWeight(Math.max(0, Number(e.target.value)))}
                    className="flex-1 bg-black border border-zinc-800 rounded-lg p-3 text-center text-white font-mono outline-none"
                  />
                  <button 
                     onClick={() => setCustomWeight(customWeight + 1)}
                     className="bg-zinc-800 w-10 h-10 rounded border border-zinc-700 hover:bg-zinc-700 font-bold"
                  >+</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Obs (Opcional)</label>
                <textarea 
                  rows={2}
                  value={customObs}
                  onChange={e => setCustomObs(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 resize-none outline-none"
                  placeholder="Detalhes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-transparent hover:bg-zinc-900 text-zinc-400 py-3 rounded-lg border border-zinc-800 font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateCustom}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg shadow-lg shadow-blue-900/20 font-bold transition-all hover:scale-105"
              >
                CRIAR ITEM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}