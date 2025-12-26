import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import { Link } from 'react-router-dom'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useCharacters } from '../context/CharacterContext'
import { useAuth } from '../context/AuthContext'
import { useFirestoreTokens } from '../hooks/useFirestoreTokens'
import { useFirestoreScenarios } from '../hooks/useFirestoreScenarios'
import { db } from '../services/firebase'
import { doc, updateDoc } from 'firebase/firestore'

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
  canMove,
  isGm
}: any) => {
  const data = getCharData(token)
  const isSelected = selectedToken?.id === token.id
  const lanternaNoToken = token.lanternaAtiva && visaoNoturna
  const isDraggableDisabled = !canMove || (isSelected && showStatus) || isPanning

  const vidaAtual = data?.recursos?.vidaAtual || 0
  const vidaMaxima = data?.recursos?.vidaMaxima || 1
  const sanidadeAtual = data?.recursos?.sanidadeAtual || 0
  const sanidadeMaxima = data?.recursos?.sanidadeMaxima || 1
  const condicoes = (token as any).condicoes || []

  const showBars = token.type === 'player'

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
        className={`absolute top-0 left-0 z-[100] group touch-none select-none ${canMove ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
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

        {showBars && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 pointer-events-none z-[50] flex flex-col gap-1">
            <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-sm">
              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${Math.min((vidaAtual / vidaMaxima) * 100, 100)}%` }} />
            </div>
            {sanidadeMaxima > 0 && (
              <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-sm">
                <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${Math.min((sanidadeAtual / sanidadeMaxima) * 100, 100)}%` }} />
              </div>
            )}
          </div>
        )}

        <div className="relative z-[40]">
          <img
            src={token.foto || data?.foto}
            className={`w-20 h-20 md:w-40 md:h-40 object-contain pointer-events-none transition-all duration-300 ${isSelected ? 'drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]'}`}
            style={{ 
              transform: `rotate(${token.rotacao}deg)`,
              backgroundColor: 'transparent'
            }}
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
  const { scenarios, addScenario, removeScenario } = useFirestoreScenarios() 

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

  const toggleScenario = async (id: string, currentState: boolean) => {
    const batchPromises = scenarios.map(s => {
        if (s.ativo) return updateDoc(doc(db, 'scenarios', s.id), { ativo: false });
        return Promise.resolve();
    });
    await Promise.all(batchPromises);

    if (!currentState) {
        await updateDoc(doc(db, 'scenarios', id), { ativo: true });
    }
  }

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
              condicoes: [],
              noMapa: true
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
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
             addScenario(nome, canvas.toDataURL('image/jpeg', 0.8)) 
          }
        }
      }
    }; input.click()
  }

  const selectedData = selectedToken ? tokens.find(t => t.id === selectedToken.id) : null
  const canEdit = isGm || (selectedData?.type === 'player' && selectedData?.ownerId === user?.uid)

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0a0a0a] overflow-hidden flex flex-col select-none font-sans">
      <div className="w-full p-2 md:p-4 bg-zinc-950/80 border-b border-zinc-800 flex justify-between items-center z-[200] backdrop-blur-md">
        <div className="flex gap-2 items-center">
          <Link to="/" className="text-zinc-500 font-black text-[10px] uppercase tracking-widest px-2">← Sair</Link>
          <button onClick={() => { setShowSidebar(!showSidebar); setActiveTab('tokens'); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${showSidebar && activeTab === 'tokens' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>Tokens</button>
          {isGm && <button onClick={() => { setShowSidebar(!showSidebar); setActiveTab('maps'); }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${showSidebar && activeTab === 'maps' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>Mapas</button>}
          <button onClick={() => setVisaoNoturna(!visaoNoturna)} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg border border-zinc-800 ${visaoNoturna ? 'text-indigo-400 border-indigo-500' : 'text-zinc-600'}`}>Visão</button>
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
                            <button key={c.id} onClick={() => { addToken({ id: c.id, ownerId: c.ownerId, type: 'player', x: 750, y: 750, recursos: c.recursos, lanternaAtiva: false, rotacao: 0, nome: c.nome, foto: c.foto, condicoes: [], noMapa: true }); setShowSidebar(false); }} className="w-full flex items-center gap-3 p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500 transition-all">
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
                                <div key={t.id} className="flex items-center justify-between p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl cursor-pointer" onClick={() => updateToken(t.id, { noMapa: true })}>
                                    <div className="flex items-center gap-2 truncate">
                                        <img src={t.foto} className="w-8 h-8 rounded-lg object-cover opacity-50" />
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase truncate">{t.nome}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); removeToken(t.id); }} className="text-red-900 hover:text-red-500 text-xs px-2">✕</button>
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
                  <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${s.ativo ? 'border-green-500 bg-green-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleScenario(s.id, s.ativo)}>
                        <div className={`w-3 h-3 rounded-full ${s.ativo ? 'bg-green-500' : 'bg-zinc-700'}`} />
                        <span className={`text-[10px] font-black uppercase ${s.ativo ? 'text-white' : 'text-zinc-500'}`}>{s.nome}</span>
                    </div>
                    {s.ativo && <span className="text-[9px] font-bold text-green-500 uppercase mr-2">Visível</span>}
                    <button onClick={() => removeScenario(s.id)} className="text-red-900 hover:text-red-500 ml-2 p-2">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative flex-1 bg-black overflow-hidden">
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={0.5}
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
                
                {activeScenario && activeScenario.ativo && (
                    <img 
                        src={activeScenario.url} 
                        className="block max-w-none pointer-events-none absolute top-0 left-0 z-0" 
                        style={{ 
                            width: 'auto', 
                            height: 'auto',
                            filter: visaoNoturna ? 'brightness(0.35) contrast(1.2) sepia(0.5) hue-rotate(180deg)' : 'brightness(1)' 
                        }} 
                    />
                )}
                
                <div style={{ width: '3000px', height: '3000px', pointerEvents: 'none' }} />

                {tokens.filter((t: any) => t.noMapa !== false).map((t) => (
                  <MapToken 
                    key={t.id} 
                    token={t} 
                    isGm={isGm}
                    canMove={isGm || t.ownerId === user?.uid} 
                    selectedToken={selectedToken} 
                    mapScale={mapScale} 
                    visaoNoturna={visaoNoturna} 
                    getCharData={(tk: any) => tk.type === 'player' ? { ...tk, ...characters.find(c => c.id === tk.id) } : tk} 
                    rotacionarToken={(e: any, id: string) => { e.preventDefault(); updateToken(id, { rotacao: (tokens.find(tk => tk.id === id)?.rotacao || 0) + 45 }) }} 
                    handleTokenClick={(e: any, tk: any, drag = false) => { e.stopPropagation(); if (drag) { setSelectedToken({ id: tk.id, type: tk.type }); return; } const now = Date.now(); if (now - lastTap.current < 400) { setSelectedToken({ id: tk.id, type: tk.type }); setShowStatus(true); } else { setSelectedToken({ id: tk.id, type: tk.type }); lastTap.current = now; } }} 
                    updateTokenPos={(id: string, x: number, y: number) => updateToken(id, { x, y })} 
                    isPanning={isPanning} 
                    showStatus={showStatus} 
                  />
                ))}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {showStatus && selectedData && (
        <div className="fixed bottom-0 left-0 md:bottom-auto md:left-auto md:right-8 md:top-24 z-[300] bg-zinc-950/95 border border-zinc-800 p-8 rounded-t-[2.5rem] md:rounded-[2rem] w-full md:w-80 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <img src={(selectedData as any).foto} className="w-16 h-16 rounded-2xl object-cover" />
                    <h3 className="text-white font-black uppercase italic truncate max-w-[140px]">{(selectedData as any).nome}</h3>
                </div>
                <button onClick={() => { setSelectedToken(null); setShowStatus(false); }} className="text-zinc-600 hover:text-white text-2xl">✕</button>
            </div>

            <div className={`space-y-6 ${!canEdit ? 'pointer-events-none opacity-50 blur-[2px]' : ''}`}>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Integridade Física</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="range" 
                            min="0" 
                            max={selectedData.recursos.vidaMaxima} 
                            value={selectedData.recursos.vidaAtual} 
                            onChange={(e) => updateToken(selectedData.id, { recursos: { ...selectedData.recursos, vidaAtual: Number(e.target.value) } })} 
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            style={{ accentColor: '#dc2626' }}
                        />
                        <span className="text-white font-bold text-xs w-8 text-right">{selectedData.recursos.vidaAtual}</span>
                    </div>
                </div>
                {selectedData.type === 'player' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Estabilidade Mental</label>
                         <div className="flex items-center gap-3">
                            <input 
                                type="range" 
                                min="0" 
                                max={selectedData.recursos.sanidadeMaxima} 
                                value={selectedData.recursos.sanidadeAtual} 
                                onChange={(e) => updateToken(selectedData.id, { recursos: { ...selectedData.recursos, sanidadeAtual: Number(e.target.value) } })} 
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                style={{ accentColor: '#06b6d4' }} 
                            />
                            <span className="text-white font-bold text-xs w-8 text-right">{selectedData.recursos.sanidadeAtual}</span>
                        </div>
                    </div>
                )}
                
                <button onClick={() => updateToken(selectedData.id, { lanternaAtiva: !(selectedData as any).lanternaAtiva })} className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${(selectedData as any).lanternaAtiva ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>Luz de Lanterna</button>
                
                {canEdit && (
                   <button 
                    onClick={async () => { 
                        try {
                            await updateToken(selectedData.id, { noMapa: false }); 
                            setSelectedToken(null); 
                            setShowStatus(false); 
                        } catch (e) {
                            console.error(e)
                        }
                    }} 
                    className="w-full p-4 text-[10px] font-black uppercase text-red-600 hover:text-red-400"
                  >
                    Expulsar do Mapa
                  </button>
                )}
            </div>
             {!canEdit && <p className="text-center text-[10px] text-red-500 font-bold mt-4 uppercase">Apenas leitura</p>}
        </div>
      )}
    </div>
  )
}