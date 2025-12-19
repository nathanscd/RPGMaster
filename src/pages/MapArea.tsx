import React, { useState, useRef, useCallback, useEffect } from 'react'
import Draggable from 'react-draggable'
import { Link } from 'react-router-dom'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useCharacters } from '../context/CharacterContext'
import { Character, MapToken as MapTokenType } from '../types/Character'

type ExtendedMapToken = MapTokenType & { condicoes?: string[] }

interface MapTokenProps {
  token: ExtendedMapToken
  selectedToken: { id: string; type: 'player' | 'other' } | null
  mapScale: number
  visaoNoturna: boolean
  getCharData: (token: ExtendedMapToken) => (Character & ExtendedMapToken) | ExtendedMapToken | null
  rotacionarToken: (e: React.MouseEvent | React.TouchEvent, id: string) => void
  handleTokenClick: (e: React.MouseEvent | React.TouchEvent | any, t: ExtendedMapToken, isDragStart?: boolean) => void
  updateTokenPos: (id: string, x: number, y: number) => void
  showStatus: boolean
  isPanning: boolean
  isMeasuring: boolean
}

const MapToken = React.memo(({
  token,
  selectedToken,
  mapScale,
  visaoNoturna,
  getCharData,
  rotacionarToken,
  handleTokenClick,
  updateTokenPos,
  showStatus,
  isPanning,
  isMeasuring
}: MapTokenProps) => {
  const data = getCharData(token)
  const isSelected = selectedToken?.id === token.id
  const lanternaNoToken = token.lanternaAtiva && visaoNoturna
  const isDraggableDisabled = (isSelected && showStatus) || isPanning || isMeasuring

  const vidaAtual = data?.recursos?.vidaAtual || 0
  const vidaMaxima = data?.recursos?.vidaMaxima || 1
  const sanidadeAtual = data?.recursos?.sanidadeAtual || 0
  const sanidadeMaxima = data?.recursos?.sanidadeMaxima || 1

  const condicoes = token.condicoes || []

  return (
    <Draggable
      key={token.id}
      scale={mapScale}
      defaultPosition={{x: token.x, y: token.y}}
      onStop={(e, d) => updateTokenPos(token.id, d.x, d.y)}
      onStart={() => {
        if (!isSelected) handleTokenClick({ stopPropagation: () => {}, type: 'drag' } as any, token, true)
      }}
      disabled={isDraggableDisabled}
    >
      <div
        className="absolute top-0 left-0 z-40 group cursor-grab active:cursor-grabbing touch-none select-none"
        onContextMenu={(e) => rotacionarToken(e, token.id)}
        onClick={(e) => handleTokenClick(e, token)}
        onTouchEnd={(e) => handleTokenClick(e, token)}
      >
        {lanternaNoToken && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[1200px] md:h-[1200px] pointer-events-none z-10 transition-transform duration-100"
            style={{
              transform: `translate(-50%, -50%) rotate(${token.rotacao - 90}deg)`,
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(255,255,240,0.45) 0deg, rgba(255,255,240,0.45) 45deg, transparent 45deg)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 5%, transparent 60%)',
              maskImage: 'radial-gradient(circle at 50% 50%, black 5%, transparent 60%)',
              filter: 'blur(15px)'
            }}
          />
        )}

        <div className="absolute -top-10 md:-top-16 left-1/2 -translate-x-1/2 w-16 md:w-24 pointer-events-none z-[50] space-y-1 md:space-y-1.5">
          <div className="h-1.5 md:h-2 w-full bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-2xl">
            <div className={`h-full transition-all duration-500 ${token.type === 'player' ? 'bg-indigo-500' : 'bg-red-600'}`} style={{ width: `${(vidaAtual / vidaMaxima) * 100}%` }} />
          </div>
          {token.type === 'player' && sanidadeMaxima > 0 && (
            <div className="h-1 md:h-1.5 w-full bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-2xl">
              <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(sanidadeAtual / sanidadeMaxima) * 100}%` }} />
            </div>
          )}
        </div>

        <div className="relative z-[40]">
          <img
            src={(data as any)?.foto || (token.type === 'player' ? 'https://i.pinimg.com/originals/ae/2e/56/ae2e562090e0ea66904128f898236113.png' : 'https://i.imgur.com/ae2e562.png')}
            className={`w-20 h-20 md:w-40 md:h-40 object-contain pointer-events-none transition-all duration-300 ${isSelected ? 'brightness-125 ring-2 md:ring-4 ring-indigo-500/50 rounded-full' : ''}`}
            style={{ transform: `rotate(${token.rotacao}deg)` }}
          />
          
          <div className="absolute -bottom-2 -right-2 flex flex-wrap gap-1 max-w-[60px] justify-end pointer-events-none">
             {condicoes.includes('machucado') && <div className="w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full border border-white shadow-sm" title="Machucado" />}
             {condicoes.includes('envenenado') && <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border border-white shadow-sm" title="Envenenado" />}
             {condicoes.includes('insano') && <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-600 rounded-full border border-white shadow-sm" title="Insano" />}
             {condicoes.includes('caido') && <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full border border-white shadow-sm" title="Caído" />}
          </div>
        </div>
      </div>
    </Draggable>
  )
})

MapToken.displayName = 'MapToken'

interface ResourceControlProps {
  label: string
  current: number
  max: number
  resourceKey: string
  handleChange: (value: number) => void
}

const ResourceControl = React.memo(({ label, current, max, resourceKey, handleChange }: ResourceControlProps) => {
  const [value, setValue] = useState(current)

  useEffect(() => {
    setValue(current)
  }, [current])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    if (!isNaN(newValue) && newValue >= 0 && newValue <= max) {
      setValue(newValue)
      handleChange(newValue)
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-bold uppercase text-zinc-400">{label} ({current}/{max})</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={handleInputChange}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer range-sm"
          style={{ accentColor: resourceKey === 'vidaAtual' ? '#6366f1' : '#06b6d4' }}
        />
        <input
          type="number"
          min="0"
          max={max}
          value={value}
          onChange={handleInputChange}
          className="w-16 p-1 text-center bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
        />
      </div>
    </div>
  )
})

ResourceControl.displayName = 'ResourceControl'

interface StatusPopupProps {
  selectedData: (Character & ExtendedMapToken) | ExtendedMapToken
  handleUpdateResource: (id: string, type: 'player' | 'other', resource: string, value: number) => void
  toggleLanterna: (id: string) => void
  toggleCondition: (id: string, condition: string) => void
  setSelectedToken: (token: null) => void
  setShowStatus: (show: boolean) => void
}

const StatusPopup = React.memo(({
  selectedData,
  handleUpdateResource,
  toggleLanterna,
  toggleCondition,
  setSelectedToken,
  setShowStatus
}: StatusPopupProps) => {
  const isPlayer = selectedData?.type === 'player'
  const { vidaAtual, vidaMaxima, sanidadeAtual, sanidadeMaxima } = selectedData?.recursos || {}
  const condicoes = selectedData.condicoes || []

  if (!selectedData || !selectedData.recursos) return null

  const conditionsList = [
      { id: 'machucado', color: 'bg-red-600', label: 'Machucado' },
      { id: 'envenenado', color: 'bg-green-500', label: 'Envenenado' },
      { id: 'insano', color: 'bg-purple-600', label: 'Insano' },
      { id: 'caido', color: 'bg-yellow-500', label: 'Caído' },
  ]

  return (
    <div className="fixed bottom-0 left-0 md:bottom-auto md:left-auto md:right-8 md:top-24 z-[300] bg-zinc-950/95 border-t md:border border-zinc-800 p-6 md:p-8 rounded-t-[2rem] md:rounded-[2rem] w-full md:w-80 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 flex flex-col max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-zinc-950/0 z-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black border border-zinc-800 overflow-hidden shadow-2xl shrink-0">
              <img src={(selectedData as any).foto || 'https://i.imgur.com/ae2e562.png'} className="w-full h-full object-cover" />
           </div>
           <h3 className="text-white font-black uppercase text-base md:text-lg italic truncate max-w-[140px]">{(selectedData as any).nome}</h3>
        </div>
        <button onClick={() => { setSelectedToken(null); setShowStatus(false); }} className="text-zinc-600 hover:text-white transition-colors text-2xl md:text-3xl p-2">✕</button>
      </div>

      <div className="space-y-6 pb-4 md:pb-0">
        <ResourceControl
          label="Vida"
          current={vidaAtual || 0}
          max={vidaMaxima || 1}
          resourceKey="vidaAtual"
          handleChange={(value) => handleUpdateResource(selectedData.id, selectedData.type, 'vidaAtual', value)}
        />

        {isPlayer && sanidadeMaxima && sanidadeMaxima > 0 && (
          <ResourceControl
            label="Sanidade"
            current={sanidadeAtual || 0}
            max={sanidadeMaxima || 1}
            resourceKey="sanidadeAtual"
            handleChange={(value) => handleUpdateResource(selectedData.id, selectedData.type, 'sanidadeAtual', value)}
          />
        )}
        
        <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-zinc-400">Condições</span>
            <div className="flex gap-2 flex-wrap">
                {conditionsList.map(c => (
                    <button 
                        key={c.id}
                        onClick={() => toggleCondition(selectedData.id, c.id)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${condicoes.includes(c.id) ? `${c.color} border-white shadow-lg scale-110` : 'bg-zinc-900 border-zinc-700 opacity-50'}`}
                        title={c.label}
                    />
                ))}
            </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex flex-col space-y-3">
          <button
            onClick={() => toggleLanterna(selectedData.id)}
            className={`w-full p-3 text-xs font-black uppercase rounded-xl transition-all ${(selectedData as any).lanternaAtiva ? 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 shadow-lg' : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-yellow-500/50'}`}
          >
            {(selectedData as any).lanternaAtiva ? 'Lanterna Ativa' : 'Ativar Lanterna'}
          </button>

          <button
            onClick={() => {
              setSelectedToken(null)
              setShowStatus(false)
            }}
            className="w-full p-3 text-xs font-black uppercase bg-red-950/10 border border-red-900/20 rounded-xl text-red-500 hover:bg-red-900/20 transition-all"
          >
            Remover Token
          </button>
        </div>
      </div>
    </div>
  )
})

StatusPopup.displayName = 'StatusPopup'

const DiceRoller = React.memo(({ onClose }: { onClose: () => void }) => {
    const [result, setResult] = useState<number | null>(null)
    
    const roll = (sides: number) => {
        const val = Math.floor(Math.random() * sides) + 1
        setResult(val)
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-[400] flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-[90%] max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-center text-white font-black uppercase mb-6 tracking-widest">Rolagem de Dados</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[4, 6, 8, 10, 12, 20, 100].map(sides => (
                        <button 
                            key={sides} 
                            onClick={() => roll(sides)}
                            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all"
                        >
                            D{sides}
                        </button>
                    ))}
                </div>

                <div className="h-24 flex items-center justify-center bg-black/50 rounded-xl border border-zinc-800 mb-6">
                    {result !== null ? (
                        <span className="text-5xl font-black text-white animate-in zoom-in spin-in-180 duration-300">{result}</span>
                    ) : (
                        <span className="text-zinc-600 text-xs uppercase">Escolha um dado</span>
                    )}
                </div>

                <button onClick={onClose} className="w-full p-3 bg-zinc-900 rounded-xl text-zinc-500 font-bold uppercase text-xs hover:text-white">Fechar</button>
            </div>
        </div>
    )
})

export default function MapArea() {
  const { characters, updateCharacter } = useCharacters()
  const [selectedToken, setSelectedToken] = useState<{ id: string, type: 'player' | 'other' } | null>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [currentMap, setCurrentMap] = useState(0)
  const [visaoNoturna, setVisaoNoturna] = useState(false)
  const [activeTokens, setActiveTokens] = useState<ExtendedMapToken[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [showDice, setShowDice] = useState(false)
  const [mapScale, setMapScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [rulerStart, setRulerStart] = useState<{x: number, y: number} | null>(null)
  const [rulerEnd, setRulerEnd] = useState<{x: number, y: number} | null>(null)
  
  const transformComponentRef = useRef<any>(null)
  const lastTap = useRef(0)
  const touchHandled = useRef(false)

  const maps = [
    { name: 'Mansão', url: '/37ffa8f054f6c94695abd202bdb35d50.webp' },
    { name: 'Floresta', url: '/b32903f64bb78648639117e1e0f12ea9.avif' }
  ]

  const spawnPlayer = useCallback((char: Character) => {
    if (activeTokens.find(t => t.id === char.id)) {
      setShowSidebar(false)
      return
    }
    setActiveTokens(prev => [...prev, {
      id: char.id,
      type: 'player',
      x: 750,
      y: 750,
      recursos: char.recursos,
      lanternaAtiva: false,
      rotacao: 0,
      condicoes: []
    }])
    setShowSidebar(false)
  }, [activeTokens])

  const spawnNPC = useCallback(() => {
    const id = `npc-${Date.now()}`
    setActiveTokens(prev => [...prev, {
      id,
      nome: 'Zumbi de Sangue',
      type: 'other',
      x: 800,
      y: 800,
      foto: '/Miniatura_Zumbi_de_Sangue_em_Desconjura3Fo.webp',
      recursos: { vidaAtual: 80, vidaMaxima: 100, sanidadeAtual: 0, sanidadeMaxima: 0 },
      lanternaAtiva: false,
      rotacao: 0,
      condicoes: []
    }])
    setShowSidebar(false)
  }, [])

  const handleUpdateResource = useCallback((id: string, type: 'player' | 'other', resource: string, value: number) => {
    if (type === 'player') {
      updateCharacter(id, (char) => ({
        ...char,
        recursos: { ...char.recursos, [resource]: value }
      }))
    } else {
      setActiveTokens(prev => prev.map(t => t.id === id ? {
        ...t, recursos: { ...t.recursos, [resource]: value }
      } : t))
    }
  }, [updateCharacter])

  const toggleCondition = useCallback((id: string, condition: string) => {
      setActiveTokens(prev => prev.map(t => {
          if (t.id !== id) return t;
          const currentConditions = t.condicoes || []
          const newConditions = currentConditions.includes(condition) 
            ? currentConditions.filter(c => c !== condition)
            : [...currentConditions, condition]
          return { ...t, condicoes: newConditions }
      }))
  }, [])

  const updateTokenPos = useCallback((id: string, x: number, y: number) => {
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, x, y } : t))
  }, [])

  const toggleLanterna = useCallback((id: string) => {
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, lanternaAtiva: !t.lanternaAtiva } : t))
  }, [])

  const rotacionarToken = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault()
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, rotacao: t.rotacao + 45 } : t))
  }, [])

  const handleTokenClick = useCallback((e: React.MouseEvent | React.TouchEvent | any, t: ExtendedMapToken, isDragStart = false) => {
    e.stopPropagation?.()

    if (e.type === 'touchend') {
        touchHandled.current = true
        setTimeout(() => { touchHandled.current = false }, 500)
    } else if (e.type === 'click' && touchHandled.current) {
        return
    }

    if (isMeasuring) return

    if (isDragStart) {
      setSelectedToken({ id: t.id, type: t.type })
      return
    }

    const now = Date.now()
    const isMobile = e.type === 'touchend'

    if (isMobile) {
      touchHandled.current = true
      setTimeout(() => { touchHandled.current = false }, 500)
    }

    const timeDiff = now - lastTap.current

    if (timeDiff < 500 && timeDiff > 0) {
      setSelectedToken({ id: t.id, type: t.type })
      setShowStatus(true)
      lastTap.current = 0 
    } else {
      if (!showStatus) {
        setSelectedToken({ id: t.id, type: t.type })
      }
      lastTap.current = now
    }
  }, [showStatus, isMeasuring])

  const getCharData = useCallback((token: ExtendedMapToken | undefined): (Character & ExtendedMapToken) | ExtendedMapToken | null => {
    if (!token) return null
    if (token.type === 'player') {
      const dbChar = characters.find(c => c.id === token.id)
      if (dbChar) {
          return {
              ...token,
              ...dbChar,
              x: token.x,
              y: token.y,
              rotacao: token.rotacao,
              lanternaAtiva: token.lanternaAtiva,
              condicoes: token.condicoes || []
          }
      }
      return token
    }
    return token
  }, [characters])

  const onRulerStart = (e: any) => {
      if (!isMeasuring) return;
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const x = (clientX - rect.left) / mapScale;
      const y = (clientY - rect.top) / mapScale;

      setRulerStart({ x, y });
      setRulerEnd({ x, y });
  }

  const onRulerMove = (e: any) => {
      if (!isMeasuring || !rulerStart) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const x = (clientX - rect.left) / mapScale;
      const y = (clientY - rect.top) / mapScale;
      
      setRulerEnd({ x, y });
  }

  const onRulerEnd = () => {
      if (isMeasuring) {
          setRulerStart(null);
          setRulerEnd(null);
      }
  }

  const getDistance = () => {
      if (!rulerStart || !rulerEnd) return 0;
      const distPx = Math.sqrt(Math.pow(rulerEnd.x - rulerStart.x, 2) + Math.pow(rulerEnd.y - rulerStart.y, 2));
      return ((distPx / 50) * 1.5).toFixed(1);
  }

  const currentToken = activeTokens.find(t => t.id === selectedToken?.id)
  const selectedData = currentToken ? getCharData(currentToken) : null

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 overflow-hidden flex flex-col select-none font-sans">

      <div className="w-full p-2 md:p-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center z-[200] shadow-2xl shrink-0 overflow-x-auto">
        <div className="flex gap-2 md:gap-4 items-center min-w-max">
          <Link to="/" className="text-zinc-500 hover:text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all">← Sair</Link>
          <button onClick={() => setShowSidebar(!showSidebar)} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase text-white hover:border-indigo-500 transition-all">Tokens</button>
          <button onClick={() => setVisaoNoturna(!visaoNoturna)} className={`px-3 py-2 text-[9px] font-black uppercase border rounded-lg transition-all ${visaoNoturna ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'border-zinc-800 text-zinc-600'}`}>Visão</button>
          <button onClick={() => { setIsMeasuring(!isMeasuring); setRulerStart(null); }} className={`px-3 py-2 text-[9px] font-black uppercase border rounded-lg transition-all ${isMeasuring ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-zinc-800 text-zinc-600'}`}>Régua</button>
          <button onClick={() => setShowDice(true)} className="px-3 py-2 text-[9px] font-black uppercase border border-zinc-800 text-zinc-400 rounded-lg hover:border-white hover:text-white transition-all">Dados</button>
          <button onClick={() => transformComponentRef.current?.resetTransform()} className="px-3 py-2 text-[9px] font-black uppercase border border-zinc-800 text-zinc-600 rounded-lg hover:border-white hover:text-white transition-all tracking-widest">Centralizar</button>
        </div>
        <div className="hidden md:flex gap-2">
          {maps.map((m, idx) => (
            <button key={idx} onClick={() => setCurrentMap(idx)} className={`px-3 py-2 text-[9px] font-black uppercase border rounded-lg transition-all ${currentMap === idx ? 'border-white text-white' : 'border-zinc-800 text-zinc-600'}`}>{m.name}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full flex overflow-hidden relative">
        <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 absolute md:relative z-[150] w-64 md:w-72 h-full bg-zinc-950 border-r border-zinc-800 p-6 overflow-y-auto flex flex-col shadow-2xl shrink-0`}>
          <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-6 italic">Agentes</h3>
          <div className="grid grid-cols-1 gap-3 mb-10">
            {characters.map(c => (
              <button key={c.id} onClick={(e) => { e.stopPropagation(); spawnPlayer(c); }} className="text-left p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-indigo-500 flex items-center gap-4 group transition-all">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black border border-zinc-700 overflow-hidden shrink-0 shadow-lg">
                  <img src={c.foto || 'https://i.imgur.com/ae2e562.png'} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] md:text-[10px] font-black uppercase text-zinc-300 group-hover:text-white truncate">{c.nome}</span>
              </button>
            ))}
          </div>
          <button onClick={(e) => { e.stopPropagation(); spawnNPC(); }} className="w-full p-4 bg-red-950/10 border border-red-900/20 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-900/20 transition-all shadow-lg">+ NPC</button>
        </div>

        <div className="relative flex-1 bg-black overflow-hidden">
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit={true}
            limitToBounds={false}
            doubleClick={{ disabled: true }}
            onTransformed={(ref) => setMapScale(ref.state.scale)}
            onPanningStart={() => setIsPanning(true)}
            onPanningStop={() => setIsPanning(false)}
            panning={{ disabled: (!!selectedToken && !showStatus) || isMeasuring }}
          >
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <div 
                  className="relative inline-block" 
                  onClick={() => { setSelectedToken(null); setShowStatus(false); }}
                  onMouseDown={isMeasuring ? onRulerStart : undefined}
                  onMouseMove={isMeasuring ? onRulerMove : undefined}
                  onMouseUp={isMeasuring ? onRulerEnd : undefined}
                  onTouchStart={isMeasuring ? onRulerStart : undefined}
                  onTouchMove={isMeasuring ? onRulerMove : undefined}
                  onTouchEnd={isMeasuring ? onRulerEnd : undefined}
                  style={{ cursor: isMeasuring ? 'crosshair' : 'default' }}
              >
                <img src={maps[currentMap].url} className="block h-auto pointer-events-none" style={{ width: '1800px' }} />

                {visaoNoturna && (
                  <div className="filter" />
                )}

                {rulerStart && rulerEnd && isMeasuring && (
                    <svg className="absolute inset-0 pointer-events-none z-[100] w-full h-full overflow-visible">
                        <line x1={rulerStart.x} y1={rulerStart.y} x2={rulerEnd.x} y2={rulerEnd.y} stroke="cyan" strokeWidth={4 / mapScale} strokeDasharray="10,5" />
                        <text x={rulerEnd.x + 20} y={rulerEnd.y} fill="cyan" fontSize={24 / mapScale} fontWeight="bold" style={{ textShadow: '2px 2px 0 #000' }}>
                            {getDistance()}m
                        </text>
                        <circle cx={rulerStart.x} cy={rulerStart.y} r={5 / mapScale} fill="cyan" />
                        <circle cx={rulerEnd.x} cy={rulerEnd.y} r={5 / mapScale} fill="cyan" />
                    </svg>
                )}

                {activeTokens.map((t) => (
                  <MapToken
                    key={t.id}
                    token={t}
                    selectedToken={selectedToken}
                    mapScale={mapScale}
                    visaoNoturna={visaoNoturna}
                    getCharData={getCharData}
                    rotacionarToken={rotacionarToken}
                    handleTokenClick={handleTokenClick}
                    updateTokenPos={updateTokenPos}
                    isPanning={isPanning}
                    showStatus={showStatus}
                    isMeasuring={isMeasuring}
                  />
                ))}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {showDice && <DiceRoller onClose={() => setShowDice(false)} />}

      {showStatus && selectedToken && selectedData && (
        <StatusPopup
          selectedData={selectedData}
          handleUpdateResource={handleUpdateResource}
          toggleLanterna={toggleLanterna}
          toggleCondition={toggleCondition}
          setSelectedToken={setSelectedToken}
          setShowStatus={setShowStatus}
        />
      )}
    </div>
  )
}