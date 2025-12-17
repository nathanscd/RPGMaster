import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SheetView from './pages/SheetView'
import AddItem from './pages/AddItem'
import CreateAgent from './pages/CreateAgent'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/create" element={<CreateAgent />} />
      <Route path="/sheet/:id" element={<SheetView />} />
      <Route path="/sheet/:id/add-item" element={<AddItem />} />
    </Routes>
  )
}