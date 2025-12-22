import React, { createContext, useContext, ReactNode } from 'react'
import { useFirestoreCharacters } from '../hooks/useFirestoreCharacters'
import { Character } from '../types/Character'

interface CharacterContextType {
  characters: Character[]
  addCharacter: (char: Partial<Character> & { nome: string }) => Promise<void>
  updateCharacter: (id: string, data: Partial<Character>) => Promise<void>
  removeCharacter: (id: string) => Promise<void>
}

const CharacterContext = createContext<CharacterContextType>({} as CharacterContextType)

export function CharacterProvider({ children }: { children: ReactNode }) {
  // ATENÇÃO: Se esta linha abaixo estiver diferente, o erro vai continuar.
  // Ela deve usar o hook do Firebase, NÃO o axios.
  const { characters, addCharacter, updateCharacterDb, removeCharacter } = useFirestoreCharacters()

  return (
    <CharacterContext.Provider value={{
      characters,
      addCharacter,
      updateCharacter: updateCharacterDb,
      removeCharacter
    }}>
      {children}
    </CharacterContext.Provider>
  )
}

export const useCharacters = () => useContext(CharacterContext)