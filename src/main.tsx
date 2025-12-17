import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { CharacterProvider } from './context/CharacterContext'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CharacterProvider>
          <App />
        </CharacterProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)