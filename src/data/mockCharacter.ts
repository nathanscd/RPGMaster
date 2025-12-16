import { Character } from '../types/Character'

export const mockCharacters: Character[] = [
  {
    id: '1',
    nome: 'Arthur Cervero',
    classe: 'Combatente',
    origem: 'Acadêmico',
    atributos: { For: 3, Agi: 2, Int: 3, Vig: 3, Pre: 1 },
    recursos: {
      vidaAtual: 28,
      vidaMaxima: 30,
      peAtual: 8,
      peMaximo: 10,
      sanidadeAtual: 12,
      sanidadeMaxima: 15
    },
    defesa: { passiva: 15, pontos: 5 },
    pericias: { Luta: 10, Investigação: 6 },

    habilidades: [
      {
        nome: 'Ataque Especial',
        roll: { quantidade: 2, dado: 10 }
      }
    ],

    armas: [
      {
        nome: 'Pistola Simples',
        roll: { quantidade: 2, dado: 8 }
      },
      {
        nome: 'Faca',
        roll: { quantidade: 1, dado: 6 }
      }
    ]
  },

  {
    id: '2',
    nome: 'Dante',
    classe: 'Ocultista',
    origem: 'Cultista Arrependido',
    atributos: { For: 1, Agi: 2, Int: 4, Vig: 2, Pre: 3 },
    recursos: {
      vidaAtual: 20,
      vidaMaxima: 22,
      peAtual: 12,
      peMaximo: 14,
      sanidadeAtual: 18,
      sanidadeMaxima: 20
    },
    defesa: { passiva: 13, pontos: 3 },
    pericias: { Ocultismo: 12, Investigação: 7 },

    habilidades: [
      {
        nome: 'Ritual Amaldiçoado',
        roll: { quantidade: 1, dado: 20, modificador: 3 }
      }
    ],

    armas: [
      {
        nome: 'Grimório',
        roll: { quantidade: 1, dado: 12 }
      }
    ]
  },

  {
    id: '3',
    nome: 'Carina',
    classe: 'Especialista',
    origem: 'Investigadora',
    atributos: { For: 1, Agi: 4, Int: 3, Vig: 2, Pre: 2 },
    recursos: {
      vidaAtual: 22,
      vidaMaxima: 24,
      peAtual: 10,
      peMaximo: 12,
      sanidadeAtual: 14,
      sanidadeMaxima: 16
    },
    defesa: { passiva: 14, pontos: 4 },
    pericias: { Furtividade: 11, Percepção: 9 },

    habilidades: [
      {
        nome: 'Análise Rápida',
        roll: { quantidade: 2, dado: 6 }
      }
    ],

    armas: [
      {
        nome: 'Notebook',
        roll: { quantidade: 1, dado: 4 }
      }
    ]
  }
]
