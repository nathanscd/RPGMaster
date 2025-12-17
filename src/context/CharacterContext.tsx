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
        
        const formattedData = data.map((char: any) => ({
          ...char,
          id: char._id || char.id 
        }))

        setCharacters(formattedData)
      } catch (error) {
        console.error('Erro ao carregar personagens', error)
      }
    }

    fetchCharacters()
  }, [])

  function updateCharacter(id: string, updater: (c: Character) => Character) {
    setCharacters(prev => {
      const index = prev.findIndex(c => c.id === id || (c as any)._id === id)
      
      if (index === -1) return prev

      const oldChar = prev[index]
      const newChar = updater(oldChar)
      
      const updatedList = [...prev]
      updatedList[index] = newChar
      axios
        .put(`${API_URL}/${id}`, newChar)
        .catch(error => {
          console.error('Erro ao atualizar personagem', error)
        })

      return updatedList
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