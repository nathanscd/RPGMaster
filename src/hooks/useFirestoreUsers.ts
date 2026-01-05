import { useState, useEffect } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../services/firebase'

export interface AppUser {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  isGm?: boolean
}

export function useFirestoreUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'users'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AppUser[]
      
      setUsers(usersData)
      setLoading(false)
    }, (error) => {
      console.error(error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { users, loading }
}