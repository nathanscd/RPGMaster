export type DiceExpression = {
  quantidade: number
  dado: 4 | 6 | 8 | 10 | 12 | 20 | 100
  modificador?: number
}

export interface RollableItem {
  nome: string
  roll: DiceExpression
}

export interface Character {
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
  }

  pericias: Record<string, number>

  habilidades: RollableItem[]
  armas: RollableItem[]
}
