import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { Character } from '../types/Character'

type CharacterContextType = {
  characters: Character[]
  updateCharacter: (id: string, updater: (c: Character) => Character) => void
  deleteCharacter: (id: string) => Promise<void>
}

const CharacterContext = createContext<CharacterContextType | null>(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_URL = `${API_BASE}/api/characters`

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

      axios.put(`${API_URL}/${id}`, newChar).catch(err => console.error(err))

      return updatedList
    })
  }

  async function deleteCharacter(id: string) {
    try {
      await axios.delete(`${API_URL}/${id}`)
      setCharacters(prev => prev.filter(c => c.id !== id && (c as any)._id !== id))
    } catch (error) {
      console.error('Erro ao deletar personagem', error)
      alert('Erro ao remover do banco de dados')
    }
  }

  return (
    <CharacterContext.Provider value={{ characters, updateCharacter, deleteCharacter }}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacters() {
  const ctx = useContext(CharacterContext)
  if (!ctx) throw new Error('useCharacters deve ser usado dentro de CharacterProvider')
  return ctx
}