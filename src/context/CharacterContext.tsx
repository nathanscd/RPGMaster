import { createContext, useContext, useEffect, useState } from 'react'
import { Character } from '../types/Character'
import { mockCharacters } from '../data/mockCharacter'

type CharacterContextType = {
  characters: Character[]
  updateCharacter: (
    id: string,
    fn: (c: Character) => Character
  ) => void
}

const CharacterContext = createContext<CharacterContextType | null>(null)

const STORAGE_KEY = 'rpg_characters'

export function CharacterProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [characters, setCharacters] = useState<Character[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return mockCharacters
      }
    }
    return mockCharacters
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
  }, [characters])

  function updateCharacter(
    id: string,
    fn: (c: Character) => Character
  ) {
    setCharacters(prev =>
      prev.map(c => (c.id === id ? fn(c) : c))
    )
  }

  return (
    <CharacterContext.Provider
      value={{ characters, updateCharacter }}
    >
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacters() {
  const ctx = useContext(CharacterContext)
  if (!ctx) {
    throw new Error(
      'useCharacters deve ser usado dentro de CharacterProvider'
    )
  }
  return ctx
}
