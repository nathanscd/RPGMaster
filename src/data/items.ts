import { InventoryItem } from '../types/Character'

export const ITEMS: InventoryItem[] = [
  {
    id: 'rev',
    nome: 'Revólver',
    peso: 2,
    tipo: 'arma',
    roll: { quantidade: 2, dado: 8 }
  },
  {
    id: 'lan',
    nome: 'Lanterna',
    peso: 1,
    tipo: 'item'
  }
]
