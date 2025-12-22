import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MapArea from './pages/MapArea'
import CreateAgent from './pages/CreateAgent'
import SheetView from './pages/SheetView'
import Rules from './pages/Rules'
import AddItem from './pages/AddItem'
import { LoginPage } from './components/LoginPage'
import { useAuth } from './context/AuthContext'

function App() {
  const { user, loading } = useAuth()

  console.log("STATUS DO APP:", { user, loading })

  if (loading) {
    return <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-white">Carregando...</div>
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/map" element={<MapArea />} />
      <Route path="/create" element={<CreateAgent />} />
      <Route path="/sheet/:id" element={<SheetView />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/add-item" element={<AddItem />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App