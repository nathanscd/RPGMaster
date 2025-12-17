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

export type Character = {
  id: string
  nome: string
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
    peAtual: number
    peMaximo: number
    sanidadeAtual: number
    sanidadeMaxima: number
  }
  defesa: {
    passiva: number
    pontos: number
    [key: string]: number 
  }
  pericias: {
    [key: string]: number
  }
  habilidades: {
    nome: string
    roll?: DiceRoll
    descricao?: string
  }[]
  armas: {
    nome: string
    roll: DiceRoll
    descricao?: string
  }[]
  inventario: InventoryItem[]
  inventarioMaxPeso: number
}