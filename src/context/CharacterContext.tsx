import { createContext, useContext, useState } from 'react'
import { Character } from '../types/Character'
import { mockCharacters } from '../data/mockCharacter'

type CharacterContextType = {
  characters: Character[]
  updateCharacter: (id: string, updater: (c: Character) => Character) => void
}

const CharacterContext = createContext<CharacterContextType | null>(null)

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>(mockCharacters)

  function updateCharacter(id: string, updater: (c: Character) => Character) {
    setCharacters(prev =>
      prev.map(c => (c.id === id ? updater(c) : c))
    )
  }

  return (
    <CharacterContext.Provider value={{ characters, updateCharacter }}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacters() {
  const ctx = useContext(CharacterContext)
  if (!ctx) throw new Error('Contexto não encontrado')
  return ctx
}
