import { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { Link } from 'react-router-dom'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useCharacters } from '../context/CharacterContext'

export default function MapArea() {
  const { characters, updateCharacter } = useCharacters()
  const [selectedToken, setSelectedToken] = useState<{ id: string, type: 'player' | 'other' } | null>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [currentMap, setCurrentMap] = useState(0)
  const [visaoNoturna, setVisaoNoturna] = useState(false)
  const [activeTokens, setActiveTokens] = useState<any[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [mapScale, setMapScale] = useState(1)
  const transformComponentRef = useRef<any>(null)

  const maps = [
    { name: 'Mansão', url: '/37ffa8f054f6c94695abd202bdb35d50.webp' },
    { name: 'Floresta', url: '/b32903f64bb78648639117e1e0f12ea9.avif' }
  ]

  const spawnPlayer = (char: any) => {
    if (activeTokens.find(t => t.id === char.id)) return
    setActiveTokens([...activeTokens, { 
      id: char.id,
      type: 'player', 
      x: 750, 
      y: 750, 
      lanternaAtiva: false,
      rotacao: 90 
    }])
  }

  const spawnNPC = () => {
    const id = `npc-${Date.now()}`
    setActiveTokens([...activeTokens, { 
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
  }

  const handleUpdateResource = (id: string, type: string, resource: 'vidaAtual' | 'sanidadeAtual', value: number) => {
    if (type === 'player') {
      updateCharacter(id, (char: any) => ({ 
        ...char, 
        recursos: { ...char.recursos, [resource]: value } 
      }))
    } else {
      setActiveTokens(prev => prev.map(t => t.id === id ? { 
        ...t, recursos: { ...t.recursos, [resource]: value } 
      } : t))
    }
  }

  const updateTokenPos = (id: string, x: number, y: number) => {
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, x, y } : t))
  }

  const toggleLanterna = (id: string) => {
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, lanternaAtiva: !t.lanternaAtiva } : t))
  }

  const rotacionarToken = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setActiveTokens(prev => prev.map(t => t.id === id ? { ...t, rotacao: (t.rotacao + 45) % 360 } : t))
  }

  const getCharData = (token: any) => {
    if (!token) return null
    if (token.type === 'player') {
      const dbChar = characters.find(c => c.id === token.id)
      return dbChar ? { ...dbChar, ...token } : token
    }
    return token
  }

  const currentToken = activeTokens.find(t => t.id === selectedToken?.id)
  const selectedData = getCharData(currentToken)

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden flex flex-col select-none touch-none font-sans">
      
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
                  <img src={(c as any).foto || 'https://i.imgur.com/ae2e562.png'} className="w-full h-full object-cover" />
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
            panning={{ disabled: !!selectedToken }}
          >
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <div className="relative inline-block" onClick={() => { setSelectedToken(null); setShowStatus(false); }}>
                <img src={maps[currentMap].url} className="block h-auto pointer-events-none" style={{ width: '1800px' }} />
                
                {visaoNoturna && (
                  <div className="filter" />
                )}

                {activeTokens.map((t) => {
                  const data = getCharData(t)
                  const isSelected = selectedToken?.id === t.id
                  const lanternaNoToken = t.lanternaAtiva && visaoNoturna

                  return (
                    <Draggable 
                      key={t.id} 
                      scale={mapScale} 
                      position={{x: t.x, y: t.y}} 
                      onDrag={(e, d) => updateTokenPos(t.id, d.x, d.y)}
                      onStart={() => { if (!showStatus) setSelectedToken({ id: t.id, type: t.type }); }}
                      disabled={isSelected && showStatus}
                    >
                      <div 
                        className="absolute top-0 left-0 z-40 group cursor-grab active:cursor-grabbing" 
                        onContextMenu={(e) => rotacionarToken(e, t.id)} 
                        onDoubleClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedToken({ id: t.id, type: t.type }); 
                          setShowStatus(true);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lanternaNoToken && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none z-10"
                            style={{ 
                              transform: `translate(-50%, -50%) rotate(${t.rotacao - 90}deg)`,
                              background: 'conic-gradient(from 0deg at 50% 50%, rgba(255,255,240,0.45) 0deg, rgba(255,255,240,0.45) 45deg, transparent 45deg)',
                              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 5%, transparent 60%)',
                              maskImage: 'radial-gradient(circle at 50% 50%, black 5%, transparent 60%)',
                              filter: 'blur(15px)'
                            }}
                          />
                        )}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 pointer-events-none z-[50] space-y-1.5">
                          <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-2xl">
                            <div className={`h-full transition-all duration-500 ${t.type === 'player' ? 'bg-indigo-500' : 'bg-red-600'}`} style={{ width: `${(data.recursos.vidaAtual / data.recursos.vidaMaxima) * 100}%` }} />
                          </div>
                          {t.type === 'player' && (
                            <div className="h-1.5 w-full bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-2xl">
                              <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(data.recursos.sanidadeAtual / data.recursos.sanidadeMaxima) * 100}%` }} />
                            </div>
                          )}
                        </div>
                        <div className="relative z-[40]">
                          <img src={(data as any).foto || (t.type === 'player' ? 'https://i.pinimg.com/originals/ae/2e/56/ae2e562090e0ea66904128f898236113.png' : 'https://i.imgur.com/ae2e562.png')} className={`w-32 h-32 md:w-40 md:h-40 object-contain pointer-events-none transition-all duration-300 ${isSelected ? 'brightness-125' : ''}`} style={{ transform: `rotate(${t.rotacao}deg)` }} />
                        </div>
                      </div>
                    </Draggable>
                  )
                })}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        {showStatus && selectedToken && selectedData && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 md:top-24 z-[300] bg-zinc-950/95 border border-zinc-800 p-6 md:p-8 rounded-[2rem] w-[92%] md:w-80 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in slide-in-from-bottom-10 md:slide-in-from-right-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-800 overflow-hidden shadow-2xl">
                    <img src={(selectedData as any).foto || 'https://i.imgur.com/ae2e562.png'} className="w-full h-full object-cover" />
                 </div>
                 <h3 className="text-white font-black uppercase text-lg italic truncate max-w-[140px]">{selectedData.nome}</h3>
              </div>
              <button onClick={() => { setSelectedToken(null); setShowStatus(false); }} className="text-zinc-600 hover:text-white transition-colors text-3xl">✕</button>
            </div>
            <div className="space-y-8">
              <div className="flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Lanterna</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleLanterna(selectedToken.id); }} className={`w-16 h-8 rounded-full transition-all relative ${currentToken?.lanternaAtiva ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${currentToken?.lanternaAtiva ? 'left-9' : 'left-1'}`} />
                </button>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase mb-3 tracking-widest">
                  <span className="text-red-500 font-bold italic">Integridade</span>
                  <span className="text-zinc-400 font-bold">{selectedData.recursos.vidaAtual} / {selectedData.recursos.vidaMaxima}</span>
                </div>
                <input type="range" min="0" max={selectedData.recursos.vidaMaxima} value={selectedData.recursos.vidaAtual} onChange={(e) => handleUpdateResource(selectedToken.id, selectedToken.type, 'vidaAtual', Number(e.target.value))} className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-red-600 shadow-inner" />
              </div>
              {selectedToken.type === 'player' && (
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-3 tracking-widest">
                    <span className="text-cyan-500 font-bold italic">Sanidade</span>
                    <span className="text-zinc-400 font-bold">{selectedData.recursos.sanidadeAtual} / {selectedData.recursos.sanidadeMaxima}</span>
                  </div>
                  <input type="range" min="0" max={selectedData.recursos.sanidadeMaxima} value={selectedData.recursos.sanidadeAtual} onChange={(e) => handleUpdateResource(selectedToken.id, selectedToken.type, 'sanidadeAtual', Number(e.target.value))} className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-600 shadow-inner" />
                </div>
              )}
              <button onClick={() => { setActiveTokens(prev => prev.filter(t => t.id !== selectedToken.id)); setSelectedToken(null); setShowStatus(false); }} className="w-full py-5 bg-red-950/20 text-red-500 text-[10px] font-black uppercase border border-red-900/30 rounded-2xl hover:bg-red-600 hover:text-white shadow-xl tracking-widest">Eliminar da Mesa</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}