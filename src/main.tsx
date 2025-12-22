import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { CharacterProvider } from './context/CharacterContext' // <--- Confirme se é este
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext' // Se tiver

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <CharacterProvider> {/* Ele precisa estar aqui dentro */}
            <App />
          </CharacterProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)