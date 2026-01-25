import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Plants from './pages/Plants'
import Tasks from './pages/Tasks'
import ArchivedPlants from './pages/ArchivedPlants'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/archive" element={<ArchivedPlants />} />
      </Routes>
    </Layout>
  )
}

export default App
