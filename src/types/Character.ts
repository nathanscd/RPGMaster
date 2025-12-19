export type DiceRoll = {
  quantidade: number
  dado: number
  modificador?: number
}

export type RollableItem = {
  nome: string
  roll: {
    quantidade: number
    dado: number
    modificador?: number
  }
}

export type InventoryItem = {
  id: string
  instanceId?: number 
  nome: string
  peso: number
  tipo: string 
  roll?: DiceRoll
  descricao?: string
}

export interface Character {
  id: string
  _id?: string
  nome: string
  foto?: string
  classe: string
  origem: string
  atributos: {
    For: number
    Agi: number
    Int: number
    Vig: number
    Pre: number
  }
  recursos: {
    vidaAtual: number
    vidaMaxima: number
    peAtual?: number
    peMaximo?: number
    sanidadeAtual: number
    sanidadeMaxima: number
  }
  defesa?: {
    passiva: number
    pontos: number
  }
  pericias?: Record<string, number>
  habilidades?: Array<{
    nome: string
    roll: { quantidade: number; dado: number }
  }>
  armas?: any[]
  inventario?: any[]
  inventarioMaxPeso?: number
}

export interface MapToken {
  id: string
  type: 'player' | 'other'
  x: number
  y: number
  rotacao: number
  lanternaAtiva: boolean
  nome?: string
  foto?: string
  recursos: {
    vidaAtual: number
    vidaMaxima: number
    sanidadeAtual: number
    sanidadeMaxima: number
  }
}
