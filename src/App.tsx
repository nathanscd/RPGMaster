import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SheetView from './pages/SheetView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/sheet/:id" element={<SheetView />} />
    </Routes>
  )
}
