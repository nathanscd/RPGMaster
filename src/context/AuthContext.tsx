import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/firebase'
import { GoogleAuthProvider, signInWithPopup, signOut, User, onAuthStateChanged } from 'firebase/auth'

// --- IMPORTANTE: COLOQUE SEU E-MAIL AQUI ---
const GM_EMAIL = "nathansec26@gmail.com" 
// -------------------------------------------

interface AuthContextType {
  user: User | null
  login: () => Promise<void>
  logout: () => Promise<void>
  isGm: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  // Verifica se o usuário logado é o Mestre
  const isGm = user?.email === GM_EMAIL

  return (
    <AuthContext.Provider value={{ user, login, logout, isGm, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)