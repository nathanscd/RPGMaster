import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { MapToken } from '../types/Character'

export function useMapTokens() {
  const [tokens, setTokens] = useState<MapToken[]>([])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'active_tokens'), (snapshot) => {
      const liveTokens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MapToken))
      setTokens(liveTokens)
    })
    return () => unsubscribe()
  }, [])

  const moveToken = async (id: string, x: number, y: number) => {
    await updateDoc(doc(db, 'active_tokens', id), { x, y })
  }

  const addToken = async (token: MapToken) => {
    await setDoc(doc(db, 'active_tokens', token.id), token)
  }

  const removeToken = async (id: string) => {
    await deleteDoc(doc(db, 'active_tokens', id))
  }

  return { tokens, moveToken, addToken, removeToken }
}