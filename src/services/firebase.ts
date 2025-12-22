import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyC78zaGYGobDc71rzcSPi_-IbiD4ZA1ur0",
  authDomain: "rpgmaster-ns.firebaseapp.com",
  projectId: "rpgmaster-ns",
  storageBucket: "rpgmaster-ns.firebasestorage.app",
  messagingSenderId: "850384531536",
  appId: "1:850384531536:web:4a1604f26b32d0b2d6a155",
  measurementId: "G-MWESSV7TYH"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)