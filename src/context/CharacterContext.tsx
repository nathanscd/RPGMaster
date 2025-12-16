import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { Character } from '../types/Character'

type CharacterContextType = {
  characters: Character[]
  updateCharacter: (id: string, updater: (c: Character) => Character) => void
}

const CharacterContext = createContext<CharacterContextType | null>(null)

const API_URL = 'http://localhost:3001/api/characters'

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    async function fetchCharacters() {
      try {
        const { data } = await axios.get(API_URL)
        setCharacters(data)
      } catch (error) {
        console.error('Erro ao carregar personagens', error)
      }
    }

    fetchCharacters()
  }, [])

  function updateCharacter(id: string, updater: (c: Character) => Character) {
    setCharacters(prev => {
      const updatedCharacters = prev.map(c =>
        (c as any)._id === id ? updater(c) : c
      )

      const updatedCharacter = updatedCharacters.find(c => (c as any)._id === id)
      if (updatedCharacter) {
        axios
          .put(`${API_URL}/${id}`, updatedCharacter)
          .catch(error => {
            console.error('Erro ao atualizar personagem', error)
          })
      }

      return updatedCharacters
    })
  }

  return (
    <CharacterContext.Provider value={{ characters, updateCharacter }}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacters() {
  const ctx = useContext(CharacterContext)
  if (!ctx) {
    throw new Error('useCharacters deve ser usado dentro de CharacterProvider')
  }
  return ctx
}
