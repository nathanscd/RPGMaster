// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Sheet from './pages/SheetView'
import CreateAgent from './pages/CreateAgent'
import MapArea from './pages/MapArea'
import Rulebook from './pages/Rules'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/create" element={<CreateAgent />} />
      <Route path="/sheet/:id" element={<Sheet />} />
      <Route path="/map" element={<MapArea />} /> 
      <Route path="/rules" element={<Rulebook />} /> 
    </Routes>
  )
}

export default App