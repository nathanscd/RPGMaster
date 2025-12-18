import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Rulebook() {
  const [search, setSearch] = useState('')

  const data = {
    sistema: [
      {
        title: "Testes e Atributos",
        content: "Role d20s igual ao valor do atributo. Use o melhor resultado. Se o atributo for 0, role 2d20 e use o pior.",
        rules: ["FOR: Esforço físico e dano", "AGI: Reflexos e Pontaria", "INT: Investigação e Rituais", "VIG: Saúde e Resistência", "PRE: Presença e Vontade"]
      },
      {
        title: "Dificuldades (DT)",
        content: "O mestre define o quão difícil é uma ação antes da rolagem.",
        rules: ["Fácil: 10", "Médio: 15", "Difícil: 20", "Extremo: 25", "Impossível: 30"]
      }
    ],
    combate: [
      {
        title: "Ações no Turno",
        content: "No seu turno você possui um conjunto limitado de ações.",
        rules: ["Padrão: Atacar ou usar Ritual", "Movimento: Deslocar-se 9m", "Livre: Falar ou soltar itens", "Reação: Esquivar ou Bloquear"]
      },
      {
        title: "Defesa e Dano",
        content: "A Defesa padrão é 10 + AGI + Bônus de Esquipamento.",
        rules: ["Esquiva: +AGI na Defesa", "Bloqueio: Reduz dano (Fortitude)", "Crítico: Dobra os dados de dano", "Morrendo: 0 PV deixa você Caído"]
      }
    ],
    armas: [
      {
        name: "Faca",
        tipo: "Simples / Curto",
        dano: "1d4",
        crit: "19 / x2"
      },
      {
        name: "Machadinha",
        tipo: "Simples / Curto",
        dano: "1d6",
        crit: "x3"
      },
      {
        name: "Revólver",
        tipo: "Simples / Médio",
        dano: "2d6",
        crit: "18 / x2"
      },
      {
        name: "Espada",
        tipo: "Marcial / Curto",
        dano: "1d8",
        crit: "19 / x2"
      },
      {
        name: "Fuzil de Assalto",
        tipo: "Marcial / Longo",
        dano: "2d10",
        crit: "x3"
      }
    ],
    rituais: [
      {
        title: "Elementos",
        content: "O Outro Lado é dividido em cinco entidades ou conceitos fundamentais.",
        rules: ["Sangue: Sentimento e dor", "Morte: Tempo e entropia", "Energia: Caos e mudança", "Conhecimento: Lógica e símbolos", "Medo: O abismo infinito"]
      },
      {
        title: "Círculos e Custo",
        content: "Rituais consomem Pontos de Esforço (PE) e exigem testes de Ocultismo.",
        rules: ["1º Círculo: 1 PE", "2º Círculo: 3 PE", "3º Círculo: 6 PE", "4º Círculo: 10 PE"]
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
            <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Manual de Regras Ordem Paranormal</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 flex-1 md:max-w-lg">
            <input 
              type="text"
              placeholder="BUSCAR NO REGISTRO..."
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
              <h2 className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.5em] mb-10 border-b border-zinc-900 pb-4">I. Mecânicas Base</h2>
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
              <h2 className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.5em] mb-10 border-b border-zinc-900 pb-4">II. Arsenal e Equipamento</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                      <th className="px-6 pb-4">Nome</th>
                      <th className="px-6 pb-4">Tipo/Alcance</th>
                      <th className="px-6 pb-4">Dano</th>
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
              <h2 className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.5em] mb-10 border-b border-zinc-900 pb-4">III. Transcendência</h2>
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

        <footer className="mt-32 mb-12 py-12 border-t border-zinc-900 flex flex-col items-center gap-4">
          <div className="flex gap-8 text-zinc-800 font-black text-[8px] uppercase tracking-[0.8em]">
            <span>Ordem Paranormal</span>
            <span>Acesso Nível 4</span>
            <span>2025</span>
          </div>
          <p className="text-zinc-600 font-bold text-[7px] uppercase tracking-[0.2em]">O Conhecimento é a Única Proteção Contra o Medo</p>
        </footer>

      </div>
    </div>
  )
}