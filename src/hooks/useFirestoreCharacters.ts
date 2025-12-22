import { useState, useEffect, useCallback } from 'react'
import { db } from '../services/firebase'
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { Character } from '../types/Character'
import { useAuth } from '../context/AuthContext'

export function useFirestoreCharacters() {
  const [characters, setCharacters] = useState<Character[]>([])
  const { user, isGm } = useAuth()

  useEffect(() => {
    if (!user) {
        setCharacters([])
        return
    }

    const collectionRef = collection(db, 'characters')
    let q;

    if (isGm) {
        q = query(collectionRef) // Mestre vê tudo
    } else {
        q = query(collectionRef, where('ownerId', '==', user.uid)) // Player vê o seu
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveChars = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Character))
      setCharacters(liveChars)
    })

    return () => unsubscribe()
  }, [user, isGm])

  const addCharacter = useCallback(async (char: Partial<Character>) => {
    if (!user) return
    
    const defaultData = {
        classe: 'Desconhecida',
        origem: 'Desconhecida',
        foto: 'https://i.imgur.com/ae2e562.png',
        atributos: { For: 1, Agi: 1, Int: 1, Vig: 1, Pre: 1 },
        recursos: { vidaAtual: 10, vidaMaxima: 10, sanidadeAtual: 10, sanidadeMaxima: 10 },
        inventario: [],
        pericias: {}
    }

    await addDoc(collection(db, 'characters'), { 
        ...defaultData,
        ...char, 
        ownerId: user.uid,
        ownerName: user.displayName || 'Anônimo' // Salva o nome para exibir no Dashboard
    })
  }, [user])

  const updateCharacterDb = useCallback(async (id: string, data: Partial<Character>) => {
    await updateDoc(doc(db, 'characters', id), data)
  }, [])

  const removeCharacter = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'characters', id))
  }, [])

  return { characters, addCharacter, updateCharacterDb, removeCharacter }
}