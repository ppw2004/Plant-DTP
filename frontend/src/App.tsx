import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
      </Routes>
    </Layout>
  )
}

export default App
