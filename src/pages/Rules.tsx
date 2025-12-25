import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Rulebook() {
  const [search, setSearch] = useState('')

  const data = {
    sistema: [
      {
        title: "Atributos Base",
        content: "Os cinco pilares que definem as capacidades físicas e mentais do agente.",
        rules: [
          "AGI (Agilidade): Pontaria, Pilotagem, Furtividade, Reflexos",
          "FOR (Força): Luta, Atletismo, Carga, Dano corpo a corpo",
          "INT (Intelecto): Perícias, Conhecimento, Tecnologia",
          "PRE (Presença): Vontade, Diplomacia, Rituais, PE",
          "VIG (Vigor): PV, Fortitude, Resistência física"
        ]
      },
      {
        title: "Testes e Perícias",
        content: "Role d20 + Bônus da Perícia. Se for destreinado, role apenas o dado.",
        rules: [
          "Destreinado: +0 (Apenas o d20)",
          "Treinado (NEX 5%): +5 no resultado",
          "Veterano (NEX 35%): +10 no resultado",
          "Expert (NEX 70%): +15 no resultado",
          "1 e 20: 20 é Sucesso Automático (Crítico), 1 é Falha Automática"
        ]
      },
      {
        title: "Cálculo de Vida (PV) e Esforço (PE)",
        content: "Definido pela Classe + Atributo. Aumenta a cada 5% de NEX (Nível).",
        rules: [
          "Nível do Personagem: NEX dividido por 5",
          "PV Total: Inicial + [(Ganho Classe + VIG) × (Nível - 1)]",
          "PE Total: Inicial + [(Ganho Classe + PRE) × (Nível - 1)]",
          "Sanidade: Valor fixo da classe, não soma atributos",
          "Peso: Força × 5 (Se Força 0, carrega 2 espaços)"
        ]
      },
      {
        title: "Dificuldades (DT)",
        content: "O valor alvo que o jogador precisa alcançar para ter sucesso.",
        rules: ["Fácil: 10", "Médio: 15", "Difícil: 20", "Extremo: 25", "Impossível: 30+"]
      }
    ],
    combate: [
      {
        title: "Estrutura do Turno",
        content: "O combate é dividido em rodadas. Cada personagem tem um turno.",
        rules: [
          "Ação Padrão: Atacar, Conjurar Ritual, Habilidade",
          "Ação de Movimento: Deslocar até 9m, levantar-se, sacar item",
          "Ação Livre: Falar, soltar item, gastar PE em reação",
          "Reação: Esquivar, Bloquear ou Contra-Ataque (gasta reação)"
        ]
      },
      {
        title: "Defesa e Reações",
        content: "Evitar o dano é tão importante quanto causá-lo.",
        rules: [
          "Defesa Passiva: 10 + AGI + Equipamentos",
          "Esquiva: Reação. Soma perícia Reflexos na Defesa",
          "Bloqueio: Reação. Reduz dano baseado na Fortitude",
          "Contra-Ataque: Reação. Faz um ataque imediato (se tiver habilidade)"
        ]
      }
    ],
    armas: [
      {
        name: "Faca",
        tipo: "C. a C. / Leve",
        dano: "1d4 (19)",
        crit: "x2"
      },
      {
        name: "Bastão",
        tipo: "C. a C. / Uma mão",
        dano: "1d6 (19)",
        crit: "x2"
      },
      {
        name: "Katana",
        tipo: "C. a C. / Duas mãos",
        dano: "1d10 (19)",
        crit: "x2"
      },
      {
        name: "Revólver",
        tipo: "Bala / Curto",
        dano: "2d6 (19)",
        crit: "x3"
      },
      {
        name: "Pistola",
        tipo: "Bala / Curto",
        dano: "1d12 (18)",
        crit: "x2"
      },
      {
        name: "Fuzil de Assalto",
        tipo: "Bala / Médio",
        dano: "2d10 (19)",
        crit: "x3"
      },
      {
        name: "Arco Composto",
        tipo: "Flecha / Médio",
        dano: "1d10 (19)",
        crit: "x3"
      }
    ],
    rituais: [
      {
        title: "Custo do Paranormal",
        content: "Conjurar rituais exige sanidade mental e esforço físico.",
        rules: [
          "Custo de PE: 1º Círculo (1 PE), 2º (3 PE), 3º (6 PE), 4º (10 PE)",
          "Teste de Ocultismo: Necessário para evitar perder Sanidade",
          "Falha no Custo: Perde Sanidade igual ao Custo do Ritual",
          "Componentes: Rituais exigem componentes do elemento (sacar é livre)"
        ]
      },
      {
        title: "Elementos e Entidades",
        content: "As cinco energias que compõem o Outro Lado.",
        rules: [
          "Sangue (Sentimento): Dano físico, cura, bestialidade",
          "Morte (Tempo): Necrose, lodo, distorção temporal",
          "Energia (Caos): Elementos naturais, luz, temperatura, tecnologia",
          "Conhecimento (Razão): Mente, sigilos, saber proibido",
          "Medo (Infinito): O impossível, a cola da realidade"
        ]
      }
    ]
  }

  const filteredSistema = data.sistema.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase()))
  const filteredCombate = data.combate.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
  const filteredArmas = data.armas.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const filteredRituais = data.rituais.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans p-6 md:p-12 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <h1 className="text-white font-black uppercase text-5xl italic tracking-tighter">Livro de regras</h1>
            <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Agência de Ordem Paranormal</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 flex-1 md:max-w-lg">
            <input 
              type="text"
              placeholder="PESQUISAR REGRA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-[10px] font-black uppercase text-white focus:border-indigo-500 outline-none transition-all"
            />
            <Link to="/" className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase text-white hover:border-white transition-all text-center">
              Voltar
            </Link>
          </div>
        </header>

        <div className="space-y-24">
          
          {(filteredSistema.length > 0 || filteredCombate.length > 0) && (
            <section>
              <h2 className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.5em] mb-10 border-b border-zinc-900 pb-4">I. Sistema & Combate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...filteredSistema, ...filteredCombate].map((item, i) => (
                  <div key={i} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] hover:border-zinc-700 transition-all group">
                    <h3 className="text-white font-black uppercase text-sm mb-4 tracking-widest group-hover:text-indigo-500 transition-colors">{item.title}</h3>
                    <p className="text-zinc-500 text-xs italic mb-6 leading-relaxed">"{item.content}"</p>
                    <div className="space-y-2">
                      {item.rules.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 p-3 bg-zinc-900/20 rounded-xl border border-zinc-800/50">
                          <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredArmas.length > 0 && (
            <section>
              <h2 className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.5em] mb-10 border-b border-zinc-900 pb-4">II. Arsenal</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                      <th className="px-6 pb-4">Nome</th>
                      <th className="px-6 pb-4">Tipo</th>
                      <th className="px-6 pb-4">Dano (Margem)</th>
                      <th className="px-6 pb-4">Crítico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArmas.map((arma, i) => (
                      <tr key={i} className="bg-zinc-950 border border-zinc-900 group">
                        <td className="px-6 py-4 rounded-l-2xl border-y border-l border-zinc-900 text-white font-black text-[10px] uppercase group-hover:border-zinc-700">{arma.name}</td>
                        <td className="px-6 py-4 border-y border-zinc-900 text-zinc-500 text-[9px] font-bold uppercase group-hover:border-zinc-700">{arma.tipo}</td>
                        <td className="px-6 py-4 border-y border-zinc-900 text-red-500 font-black text-[10px] group-hover:border-zinc-700">{arma.dano}</td>
                        <td className="px-6 py-4 rounded-r-2xl border-y border-r border-zinc-900 text-zinc-400 font-bold text-[9px] group-hover:border-zinc-700">{arma.crit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {filteredRituais.length > 0 && (
            <section>
              <h2 className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.5em] mb-10 border-b border-zinc-900 pb-4">III. O Outro Lado</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredRituais.map((item, i) => (
                  <div key={i} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] hover:border-indigo-900 transition-all group">
                    <h3 className="text-white font-black uppercase text-sm mb-4 tracking-widest group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                    <p className="text-zinc-500 text-xs italic mb-6">"{item.content}"</p>
                    <div className="grid grid-cols-1 gap-2">
                      {item.rules.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 p-3 bg-indigo-950/10 rounded-xl border border-indigo-900/20">
                          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-tighter">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}