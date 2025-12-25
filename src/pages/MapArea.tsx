import React, { useState, useRef, useCallback, useEffect } from 'react'
import Draggable from 'react-draggable'
import { Link } from 'react-router-dom'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useCharacters } from '../context/CharacterContext'
import { useAuth } from '../context/AuthContext'
import { useFirestoreTokens } from '../hooks/useFirestoreTokens'
import { useFirestoreScenarios } from '../hooks/useFirestoreScenarios'
import { Character, MapToken as MapTokenType } from '../types/Character'

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
  canMove
}: any) => {
  const data = getCharData(token)
  const isSelected = selectedToken?.id === token.id
  const lanternaNoToken = token.lanternaAtiva && visaoNoturna
  const isDraggableDisabled = !canMove || (isSelected && showStatus) || isPanning

  const vidaAtual = data?.recursos?.vidaAtual || 0
  const vidaMaxima = data?.recursos?.vidaMaxima || 1
  const condicoes = (token as any).condicoes || []

  return (
    <Draggable
      key={token.id}
      scale={mapScale}
      position={{x: token.x, y: token.y}}
      onStop={(e, d) => updateTokenPos(token.id, d.x, d.y)}
      onStart={() => {
        if (!isSelected) handleTokenClick({ stopPropagation: () => {} } as any, token, true)
      }}
      disabled={isDraggableDisabled}
    >
      <div
        className={`absolute top-0 left-0 z-40 group touch-none select-none ${canMove ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onContextMenu={(e) => canMove && rotacionarToken(e, token.id)}
        onClick={(e) => handleTokenClick(e, token)}
      >
        {lanternaNoToken && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-10"
            style={{
              transform: `translate(-50%, -50%)`,
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(255,255,240,0.3) 0deg, rgba(255,255,240,0.3) 45deg, transparent 45deg)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 10%, transparent 70%)',
              maskImage: 'radial-gradient(circle at 50% 50%, black 10%, transparent 70%)',
              filter: 'blur(20px)'
            }}
          />
        )}

        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 pointer-events-none z-[50]">
          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-xl backdrop-blur-sm">
            <div className={`h-full transition-all duration-500 ${token.type === 'player' ? 'bg-indigo-500' : 'bg-red-600'}`} style={{ width: `${(vidaAtual / vidaMaxima) * 100}%` }} />
          </div>
        </div>

        <div className="relative z-[40]">
          <img
            src={token.foto || data?.foto}
            className={`w-20 h-20 md:w-40 md:h-40 object-contain pointer-events-none transition-all duration-300 ${isSelected ? 'drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]'}`}
            style={{ backgroundColor: 'transparent' }}
          />
          <div className="absolute -bottom-2 -right-2 flex flex-wrap gap-1 max-w-[60px] justify-end">
             {condicoes.map((c: string) => (
                <div key={c} className={`w-3 h-3 rounded-full border border-white shadow-sm ${c === 'machucado' ? 'bg-red-600' : c === 'envenenado' ? 'bg-green-500' : c === 'insano' ? 'bg-purple-600' : 'bg-yellow-500'}`} />
             ))}
          </div>
        </div>
      </div>
    </Draggable>
  )
})

export default function MapArea() {
  const { characters } = useCharacters()
  const { user, isGm } = useAuth()
  const { tokens, addToken, updateToken, removeToken } = useFirestoreTokens()
  const { scenarios, addScenario, setScenarioActive, removeScenario } = useFirestoreScenarios()

  const [selectedToken, setSelectedToken] = useState<any>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [visaoNoturna, setVisaoNoturna] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [mapScale, setMapScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [activeTab, setActiveTab] = useState<'tokens' | 'maps'>('tokens')
  
  const transformComponentRef = useRef<any>(null)
  const lastTap = useRef(0)
  const activeScenario = scenarios.find(s => s.ativo)

  const handleAddNpc = async () => {
    const nome = prompt("Nome do NPC:");
    const pv = Number(prompt("PV Máximo:"));
    if (!nome || !pv) return

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/png');
            
            addToken({
              id: `npc-${Date.now()}`,
              ownerId: 'gm',
              nome,
              type: 'other',
              x: 800,
              y: 800,
              foto: base64,
              recursos: { vidaAtual: pv, vidaMaxima: pv, sanidadeAtual: 0, sanidadeMaxima: 0 },
              lanternaAtiva: false,
              rotacao: 0,
              condicoes: []
            });
          }
        }
        img.src = event.target?.result as string;
      }
      reader.readAsDataURL(file);
    };
    input.click();
  }

  const handleAddMap = async () => {
    const nome = prompt("Nome do Cenário:"); if (!nome) return
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'
    input.onchange = (e: any) => {
      const reader = new FileReader(); reader.readAsDataURL(e.target.files[0])
      reader.onload = (event) => {
        const img = new Image(); img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1200
          canvas.getContext('2d')?.drawImage(img, 0, 0, 1600, 1200)
          addScenario(nome, canvas.toDataURL('image/png', 0.7))
        }
      }
    }; input.click()
  }

  const selectedData = selectedToken ? tokens.find(t => t.id === selectedToken.id) : null

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0a0a0a] overflow-hidden flex flex-col select-none font-sans">
      <div className="w-full p-2 md:p-4 bg-zinc-950/80 border-b border-zinc-800 flex justify-between items-center z-[200] backdrop-blur-md">
        <div className="flex gap-2 items-center">
          <Link to="/" className="text-zinc-500 font-black text-[10px] uppercase tracking-widest px-2">← Sair</Link>
          <button onClick={() => { setShowSidebar(!showSidebar); setActiveTab('tokens'); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${showSidebar && activeTab === 'tokens' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>Tokens</button>
          {isGm && <button onClick={() => { setShowSidebar(!showSidebar); setActiveTab('maps'); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${showSidebar && activeTab === 'maps' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>Mapas</button>}
          {isGm && <button onClick={() => setVisaoNoturna(!visaoNoturna)} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg border border-zinc-800 ${visaoNoturna ? 'text-indigo-400 border-indigo-500' : 'text-zinc-600'}`}>Visão</button>}
        </div>
      </div>

      <div className="flex-1 w-full flex overflow-hidden relative">
        {showSidebar && (
          <div className="absolute left-0 z-[250] w-72 h-full bg-zinc-950/95 border-r border-zinc-800 p-6 overflow-y-auto backdrop-blur-xl animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-[11px] font-black uppercase text-indigo-500 tracking-widest italic">{activeTab === 'tokens' ? 'Painel de Tokens' : 'Painel de Mapas'}</h3>
                <button onClick={() => setShowSidebar(false)} className="text-zinc-500 text-xl">✕</button>
            </div>

            {activeTab === 'tokens' ? (
              <div className="space-y-6">
                <div>
                    <span className="text-[9px] font-black text-zinc-600 uppercase mb-3 block tracking-tighter">Agentes de Jogadores</span>
                    <div className="grid gap-2">
                        {characters.map(c => (
                            <button key={c.id} onClick={() => { addToken({ id: c.id, ownerId: c.ownerId, type: 'player', x: 750, y: 750, recursos: c.recursos, lanternaAtiva: false, rotacao: 0, nome: c.nome, foto: c.foto, condicoes: [] }); setShowSidebar(false); }} className="w-full flex items-center gap-3 p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500 transition-all">
                                <img src={c.foto} className="w-10 h-10 object-cover" />
                                <span className="text-[10px] font-black uppercase text-zinc-300 truncate">{c.nome}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {isGm && (
                    <div>
                        <span className="text-[9px] font-black text-zinc-600 uppercase mb-3 block">Ferramentas de Mestre</span>
                        <button onClick={handleAddNpc} className="w-full p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-[10px] font-black uppercase text-red-500 mb-4 hover:bg-red-900/40">+ Criar NPC</button>
                        <div className="grid gap-2">
                            {tokens.filter(t => t.type === 'other').map(t => (
                                <div key={t.id} className="flex items-center justify-between p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                    <div className="flex items-center gap-2 truncate">
                                        <img src={t.foto} className="w-8 h-8 object-cover opacity-50" />
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase truncate">{t.nome}</span>
                                    </div>
                                    <button onClick={() => removeToken(t.id)} className="text-red-900 hover:text-red-500 text-xs px-2">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={handleAddMap} className="w-full p-3 bg-indigo-900/20 border border-indigo-900/30 rounded-xl text-[10px] font-black uppercase text-indigo-400 mb-4">+ Novo Mapa</button>
                {scenarios.map(s => (
                  <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${s.ativo ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
                    <span onClick={() => { setScenarioActive(s.id); setShowSidebar(false); }} className={`text-[10px] font-black uppercase cursor-pointer flex-1 ${s.ativo ? 'text-white' : 'text-zinc-500'}`}>{s.nome}</span>
                    <button onClick={() => removeScenario(s.id)} className="text-red-900 hover:text-red-500 ml-2">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative flex-1 bg-black overflow-hidden">
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={0.8}
            minScale={0.05}
            maxScale={10}
            limitToBounds={false}
            doubleClick={{ disabled: true }}
            onTransformed={(ref) => setMapScale(ref.state.scale)}
            onPanningStart={() => setIsPanning(true)}
            onPanningStop={() => setIsPanning(false)}
            panning={{ disabled: (!!selectedToken && !showStatus) }}
          >
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <div className="relative inline-block" onClick={() => { setSelectedToken(null); setShowStatus(false); }}>
                {activeScenario && <img src={activeScenario.url} className="block h-auto pointer-events-none transition-all duration-700" style={{ width: '2500px', filter: visaoNoturna ? 'brightness(0.35) contrast(1.2) sepia(0.5) hue-rotate(180deg)': 'brightness(1)' }} />}
                {tokens.filter((t: any) => t.noMapa !== false).map((t) => (
                  <MapToken key={t.id} token={t} canMove={isGm || t.ownerId === user?.uid} selectedToken={selectedToken} mapScale={mapScale} visaoNoturna={visaoNoturna} getCharData={(tk: any) => tk.type === 'player' ? { ...tk, ...characters.find(c => c.id === tk.id) } : tk} rotacionarToken={(e: any, id: string) => { e.preventDefault(); updateToken(id, { rotacao: (tokens.find(tk => tk.id === id)?.rotacao || 0) + 45 }) }} handleTokenClick={(e: any, tk: any, drag = false) => { e.stopPropagation(); if (drag) { setSelectedToken({ id: tk.id, type: tk.type }); return; } const now = Date.now(); if (now - lastTap.current < 400) { setSelectedToken({ id: tk.id, type: tk.type }); setShowStatus(true); } else { setSelectedToken({ id: tk.id, type: tk.type }); lastTap.current = now; } }} updateTokenPos={(id: string, x: number, y: number) => updateToken(id, { x, y })} isPanning={isPanning} showStatus={showStatus} />
                ))}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {showStatus && selectedData && (
        <div className="fixed bottom-0 left-0 md:bottom-auto md:left-auto md:right-8 md:top-24 z-[300] bg-zinc-950/95 border border-zinc-800 p-8 rounded-t-[2.5rem] md:rounded-[2rem] w-full md:w-80 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <img src={(selectedData as any).foto} className="w-16 h-16 rounded-2xl object-cover" />
                    <h3 className="text-white font-black uppercase italic truncate max-w-[140px]">{(selectedData as any).nome}</h3>
                </div>
                <button onClick={() => { setSelectedToken(null); setShowStatus(false); }} className="text-zinc-600 hover:text-white text-2xl">✕</button>
            </div>
            <div className={`space-y-6 ${!(isGm || selectedData.ownerId === user?.uid) ? 'pointer-events-none opacity-60' : ''}`}>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Integridade Física</label>
                    <input type="range" min="0" max={selectedData.recursos.vidaMaxima} value={selectedData.recursos.vidaAtual} onChange={(e) => updateToken(selectedData.id, { recursos: { ...selectedData.recursos, vidaAtual: Number(e.target.value) } })} className="w-full accent-red-600" />
                </div>
                {selectedData.type === 'player' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Estabilidade Mental</label>
                        <input type="range" min="0" max={selectedData.recursos.sanidadeMaxima} value={selectedData.recursos.sanidadeAtual} onChange={(e) => updateToken(selectedData.id, { recursos: { ...selectedData.recursos, sanidadeAtual: Number(e.target.value) } })} className="w-full accent-indigo-600" />
                    </div>
                )}
                <button onClick={() => updateToken(selectedData.id, { lanternaAtiva: !(selectedData as any).lanternaAtiva })} className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${(selectedData as any).lanternaAtiva ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>Luz de Lanterna</button>
                <button 
                onClick={() => { 
                  updateToken(selectedData.id, { noMapa: false }); 
                  setSelectedToken(null); 
                  setShowStatus(false); 
                }} 
                className="w-full p-4 text-[10px] font-black uppercase text-red-600 hover:text-red-400"
              >
                Expulsar do Mapa
              </button>
            </div>
        </div>
      )}
    </div>
  )
}