import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../services/firebase'
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

interface AuthContextData {
  user: User | null
  loading: boolean
  isGm: boolean
  signIn: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGm, setIsGm] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        const gmEmails = ['nathansec26@gmail.com']
        const isUserGm = gmEmails.includes(currentUser.email || '')
        setIsGm(isUserGm)

        const userRef = doc(db, 'users', currentUser.uid)
        await setDoc(userRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Anônimo',
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          isGm: isUserGm,
          lastLogin: new Date().toISOString()
        }, { merge: true })
      } else {
        setIsGm(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  async function signIn() {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGm, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)