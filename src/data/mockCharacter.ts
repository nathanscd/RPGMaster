import { Character } from '../types/Character'

export const mockCharacters: Character[] = [
  {
    id: '1',
    nome: 'Arthur Cervero',
    classe: 'Combatente',
    origem: 'Acadêmico',

    atributos: {
      For: 3,
      Agi: 2,
      Int: 3,
      Vig: 3,
      Pre: 1
    },

    recursos: {
      vidaAtual: 28,
      vidaMaxima: 30,
      peAtual: 8,
      peMaximo: 10,
      sanidadeAtual: 12,
      sanidadeMaxima: 15
    },

    defesa: {
      passiva: 15,
      pontos: 5
    },

    pericias: {
      Luta: 10,
      Investigação: 6
    },

    habilidades: [
      {
        nome: 'Ataque Especial',
        roll: {
          quantidade: 2,
          dado: 10
        }
      }
    ],

    armas: [
      {
        nome: 'Pistola Simples',
        roll: {
          quantidade: 2,
          dado: 8
        }
      }
    ],

    inventario: [
      {
        id: 'rev',
        nome: 'Revólver',
        peso: 2
      },
      {
        id: 'lan',
        nome: 'Lanterna',
        peso: 1
      }
    ],

    inventarioMaxPeso: 10
  }
]
