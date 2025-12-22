import { useState, useEffect, useCallback } from 'react'
import { db } from '../services/firebase'
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { MapToken } from '../types/Character'

type ExtendedMapToken = MapToken & { condicoes?: string[] }

export function useFirestoreTokens() {
  const [tokens, setTokens] = useState<ExtendedMapToken[]>([])

  useEffect(() => {
    // Escuta a coleção 'mesa_tokens' em tempo real
    const unsubscribe = onSnapshot(collection(db, 'mesa_tokens'), (snapshot) => {
      const liveTokens = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as ExtendedMapToken))
      
      setTokens(liveTokens)
    })

    return () => unsubscribe()
  }, [])

  // Adiciona um novo token ao banco (usa setDoc para definir o ID manualmente)
  const addToken = useCallback(async (token: ExtendedMapToken) => {
    await setDoc(doc(db, 'mesa_tokens', token.id), token)
  }, [])

  // Atualiza qualquer propriedade do token (posição X/Y, vida, condições)
  const updateToken = useCallback(async (id: string, data: Partial<ExtendedMapToken>) => {
    await updateDoc(doc(db, 'mesa_tokens', id), data)
  }, [])

  // Remove o token da mesa
  const removeToken = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'mesa_tokens', id))
  }, [])

  return { tokens, addToken, updateToken, removeToken }
}