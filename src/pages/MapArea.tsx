import React, { useState, useRef, useCallback } from 'react'
import Draggable from 'react-draggable'
import { Link } from 'react-router-dom'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useCharacters } from '../context/CharacterContext'
import { Character, MapToken as MapTokenType } from '../types/Character'

interface MapTokenProps {
  token: MapTokenType
  selectedToken: { id: string; type: 'player' | 'other' } | null
  mapScale: number
  visaoNoturna: boolean
  getCharData: (token: MapTokenType) => (Character & MapTokenType) | MapTokenType | null
  rotacionarToken: (e: React.MouseEvent, id: string) => void
  handleTokenClick: (e: React.MouseEvent | React.TouchEvent, t: MapTokenType, isDragStart?: boolean) => void
  updateTokenPos: (id: string, x: number, y: number) => void
  isPanning: boolean
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
  isPanning
}: MapTokenProps) => {
  const data = getCharData(token)
  const isSelected = selectedToken?.id === token.id
  const lanternaNoToken = token.lanternaAtiva && visaoNoturna

  const isDraggableDisabled = isSelected && !isPanning

  const vidaAtual = data?.recursos?.vidaAtual || 0
  const vidaMaxima = data?.recursos?.vidaMaxima || 1
  const sanidadeAtual = data?.recursos?.sanidadeAtual || 0
  const sanidadeMaxima = data?.recursos?.sanidadeMaxima || 1

  return (
    <Draggable
      key={token.id}
      scale={mapScale}
      defaultPosition={{x: token.x, y: token.y}}
      onStop={(e, d) => updateTokenPos(token.id, d.x, d.y)}
      onStart={() => {
        if (!isSelected) handleTokenClick({ stopPropagation: () => {} } as any, token, true)
      }}
      disabled={isDraggableDisabled}
    >
      <div
        className="absolute top-0 left-0 z-40 group cursor-grab active:cursor-grabbing"
        onContextMenu={(e) => rotacionarToken(e, token.id)}
        onClick={(e) => handleTokenClick(e, token)}
        onTouchEnd={(e) => handleTokenClick(e, token)}
      >
        {lanternaNoToken && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none z-10 transition-transform duration-100"
            style={{
              transform: `translate(-50%, -50%) rotate(${token.rotacao - 90}deg)`,
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(255,255,240,0.45) 0deg, rgba(255,255,240,0.45) 45deg, transparent 45deg)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 5%, transparent 60%)',
              maskImage: 'radial-gradient(circle at 50% 50%, black 5%, transparent 60%)',
              filter: 'blur(15px)'
            }}
          />
        )}

        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 pointer-events-none z-[50] space-y-1.5">
          <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-2xl">
            <div className={`h-full transition-all duration-500 ${token.type === 'player' ? 'bg-indigo-500' : 'bg-red-600'}`} style={{ width: `${(vidaAtual / vidaMaxima) * 100}%` }} />
          </div>
          {token.type === 'player' && sanidadeMaxima > 0 && (
            <div className="h-1.5 w-full bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-2xl">
              <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(sanidadeAtual / sanidadeMaxima) * 100}%` }} />
            </div>
          )}
        </div>

        <div className="relative z-[40]">
          <img
            src={(data as any)?.foto || (token.type === 'player' ? 'https://i.pinimg.com/originals/ae/2e/56/ae2e562090e0ea66904128f898236113.png' : 'https://i.imgur.com/ae2e562.png')}
            className={`w-32 h-32 object-contain pointer-events-none transition-all duration-300 ${isSelected ? 'brightness-125 ring-4 ring-indigo-500/50 rounded-full' : ''}`}
            style={{ transform: `rotate(${token.rotacao}deg)` }}
          />
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
  const [value, setValue] = React.useState(current)

  React.useEffect(() => {
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
  selectedData: (Character & MapTokenType) | MapTokenType
  handleUpdateResource: (id: string, type: 'player' | 'other', resource: string, value: number) => void
  toggleLanterna: (id: string) => void
  setSelectedToken: (token: null) => void
  setShowStatus: (show: boolean) => void
}

const StatusPopup = React.memo(({
  selectedData,
  handleUpdateResource,
  toggleLanterna,
  setSelectedToken,
  setShowStatus
}: StatusPopupProps) => {
  const isPlayer = selectedData?.type === 'player'
  const { vidaAtual, vidaMaxima, sanidadeAtual, sanidadeMaxima } = selectedData?.recursos || {}

  if (!selectedData || !selectedData.recursos) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 md:top-24 z-[300] bg-zinc-950/95 border border-zinc-800 p-6 md:p-8 rounded-[2rem] w-[92%] md:w-80 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in slide-in-from-bottom-10 md:slide-in-from-right-10" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-800 overflow-hidden shadow-2xl shrink-0">
              <img src={(selectedData as any).foto || 'https://i.imgur.com/ae2e562.png'} className="w-full h-full object-cover" />
           </div>
           <h3 className="text-white font-black uppercase text-lg italic truncate max-w-[140px]">{(selectedData as any).nome}</h3>
        </div>
        <button onClick={() => { setSelectedToken(null); setShowStatus(false); }} className="text-zinc-600 hover:text-white transition-colors text-3xl">✕</button>
      </div>

      <div className="space-y-6">
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

        <div className="pt-4 border-t border-zinc-800 flex flex-col space-y-3">
          <button
            onClick={() => toggleLanterna(selectedData.id)}
            className={`w-full p-3 text-xs font-black uppercase rounded-xl transition-all ${(selectedData as any).lanternaAtiva ? 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 shadow-lg' : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-yellow-500/50'}`}
          >
            {(selectedData as any).lanternaAtiva ? 'Lanterna Ativa' : 'Ativar Lanterna'}
          </button>

          <button
            onClick={() => {}}
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

export default function MapArea() {
  const { characters, updateCharacter } = useCharacters()
  const [selectedToken, setSelectedToken] = useState<{ id: string, type: 'player' | 'other' } | null>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [currentMap, setCurrentMap] = useState(0)
  const [visaoNoturna, setVisaoNoturna] = useState(false)
  const [activeTokens, setActiveTokens] = useState<MapTokenType[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [mapScale, setMapScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const transformComponentRef = useRef<any>(null)
  const lastTap = useRef(0)

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
      rotacao: 90
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
      rotacao: 0
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

  const updateTokenPos = useCallback((id: string, x: number, y: number) => {
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, x, y } : t))
  }, [])

  const toggleLanterna = useCallback((id: string) => {
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, lanternaAtiva: !t.lanternaAtiva } : t))
  }, [])

  const rotacionarToken = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, rotacao: t.rotacao + 45 } : t))
  }, [])

  const handleTokenClick = useCallback((e: React.MouseEvent | React.TouchEvent | any, t: MapTokenType, isDragStart = false) => {
    e.stopPropagation?.()

    if (isDragStart) {
      setSelectedToken({ id: t.id, type: t.type })
      return
    }

    const now = Date.now()
    const isDoubleClick = now - lastTap.current < 300

    if (isDoubleClick) {
      setSelectedToken({ id: t.id, type: t.type })
      setShowStatus(true)
    } else {
      if (!showStatus) {
        setSelectedToken({ id: t.id, type: t.type })
      }
    }
    lastTap.current = now
  }, [showStatus])

  const getCharData = useCallback((token: MapTokenType): (Character & MapTokenType) | MapTokenType | null => {
    if (!token) return null
    if (token.type === 'player') {
      const dbChar = characters.find(c => c.id === token.id)
      return dbChar ? { ...dbChar, ...token } as Character & MapTokenType : token
    }
    return token
  }, [characters])

  const currentToken = activeTokens.find(t => t.id === selectedToken?.id)
  const selectedData = getCharData(currentToken)

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 overflow-hidden flex flex-col select-none font-sans">

      <div className="w-full p-3 md:p-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center z-[200] shadow-2xl shrink-0">
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-zinc-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all">← Sair</Link>
          <button onClick={() => setShowSidebar(!showSidebar)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase text-white hover:border-indigo-500 transition-all">Tokens</button>
          <button onClick={() => setVisaoNoturna(!visaoNoturna)} className={`px-4 py-2 text-[9px] font-black uppercase border rounded-lg transition-all ${visaoNoturna ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'border-zinc-800 text-zinc-600'}`}>Visão Noturna</button>
          <button onClick={() => transformComponentRef.current?.resetTransform()} className="px-4 py-2 text-[9px] font-black uppercase border border-zinc-800 text-zinc-600 rounded-lg hover:border-white hover:text-white transition-all tracking-widest">Centralizar</button>
        </div>
        <div className="hidden md:flex gap-2">
          {maps.map((m, idx) => (
            <button key={idx} onClick={() => setCurrentMap(idx)} className={`px-3 py-2 text-[9px] font-black uppercase border rounded-lg transition-all ${currentMap === idx ? 'border-white text-white' : 'border-zinc-800 text-zinc-600'}`}>{m.name}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full flex overflow-hidden relative">
        <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 absolute md:relative z-[150] w-72 h-full bg-zinc-950 border-r border-zinc-800 p-6 overflow-y-auto flex flex-col shadow-2xl shrink-0`}>
          <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-6 italic">Agentes</h3>
          <div className="grid grid-cols-1 gap-3 mb-10">
            {characters.map(c => (
              <button key={c.id} onClick={() => spawnPlayer(c)} className="text-left p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-indigo-500 flex items-center gap-4 group transition-all">
                <div className="w-12 h-12 rounded-lg bg-black border border-zinc-700 overflow-hidden shrink-0 shadow-lg">
                  <img src={c.foto || 'https://i.imgur.com/ae2e562.png'} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-300 group-hover:text-white truncate">{c.nome}</span>
              </button>
            ))}
          </div>
          <button onClick={spawnNPC} className="w-full p-4 bg-red-950/10 border border-red-900/20 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-900/20 transition-all shadow-lg">+ NPC</button>
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
            panning={{ disabled: !!selectedToken && !showStatus }}
          >
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <div className="relative inline-block" onClick={() => { setSelectedToken(null); setShowStatus(false); }}>
                <img src={maps[currentMap].url} className="block h-auto pointer-events-none" style={{ width: '1800px' }} />

                {visaoNoturna && (
                  <div className="absolute inset-0 bg-black/95 z-30 pointer-events-none transition-opacity duration-300" />
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
                  />
                ))}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {showStatus && selectedToken && selectedData && (
        <StatusPopup
          selectedData={selectedData}
          handleUpdateResource={handleUpdateResource}
          toggleLanterna={toggleLanterna}
          setSelectedToken={setSelectedToken}
          setShowStatus={setShowStatus}
        />
      )}
    </div>
  )
}
