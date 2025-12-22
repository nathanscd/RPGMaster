import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, writeBatch, getDocs } from 'firebase/firestore'
import { MapScenario } from '../types/Character'

export function useFirestoreScenarios() {
  const [scenarios, setScenarios] = useState<MapScenario[]>([])

  useEffect(() => {
    const q = collection(db, 'scenarios')
    return onSnapshot(q, (snapshot) => {
      setScenarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MapScenario)))
    })
  }, [])

  const addScenario = async (nome: string, url: string) => {
    await addDoc(collection(db, 'scenarios'), { nome, url, ativo: false })
  }

  const setScenarioActive = async (id: string) => {
    const batch = writeBatch(db)
    const allDocs = await getDocs(collection(db, 'scenarios'))
    allDocs.forEach((d) => batch.update(d.ref, { ativo: false }))
    batch.update(doc(db, 'scenarios', id), { ativo: true })
    await batch.commit()
  }

  const removeScenario = async (id: string) => {
    await deleteDoc(doc(db, 'scenarios', id))
  }

  return { scenarios, addScenario, setScenarioActive, removeScenario }
}