export type DiceExpression = {
  quantidade: number
  dado: number
  modificador?: number
}

export type InventoryItem = {
  id: string
  nome: string
  peso: number
  tipo?: 'arma' | 'item'
  roll?: {
    quantidade: number
    dado: number
    modificador?: number
  }
}

export type Rollable = {
  nome: string
  roll: DiceExpression
}

export type Character = {
  id: string
  nome: string
  classe: string
  origem: string

  atributos: Record<string, number>
  recursos: Record<string, number>
  defesa: Record<string, number>
  pericias: Record<string, number>

  habilidades: Rollable[]
  armas: Rollable[]

  inventario: InventoryItem[]
  inventarioMaxPeso: number
}
