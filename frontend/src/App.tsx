import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ==================== 布局 ====================
import Layout from './components/Layout'
// DesktopLayout 将在后续迁移到 layouts/ 目录

// ==================== 桌面版页面 ====================
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Plants from './pages/Plants'
import Tasks from './pages/Tasks'
import ArchivedPlants from './pages/ArchivedPlants'
import Suggestions from './pages/Suggestions'

// ==================== 移动端布局 ====================
// import MobileLayout from './layouts/MobileLayout'

// ==================== 移动端页面 ====================
// import MobileDashboard from './pages/mobile/MobileDashboard'
// import MobilePlants from './pages/mobile/MobilePlants'
// import MobileRooms from './pages/mobile/MobileRooms'
// import MobileTasks from './pages/mobile/MobileTasks'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== 桌面版路由 ==================== */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="plants" element={<Plants />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="archive" element={<ArchivedPlants />} />
          <Route path="suggestions" element={<Suggestions />} />
        </Route>

        {/* ==================== 移动端路由（待启用）==================== */}
        {/*
        <Route path="/mobile" element={<MobileLayout />}>
          <Route index element={<MobileDashboard />} />
          <Route path="plants" element={<MobilePlants />} />
          <Route path="rooms" element={<MobileRooms />} />
          <Route path="tasks" element={<MobileTasks />} />
        </Route>
        */}

        {/* ==================== 404页面 ==================== */}
        <Route
          path="*"
          element={
            <div style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 16
            }}>
              <h1 style={{ fontSize: 72, margin: 0 }}>🌱</h1>
              <h2>404 - 页面未找到</h2>
              <a href="/">返回首页</a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

/**
 * 双版本架构说明：
 *
 * 当前状态：桌面版正常运行
 *
 * 移动端启用步骤：
 * 1. 安装依赖：npm install antd-mobile
 * 2. 取消上面的注释
 * 3. 重新构建：npm run build
 *
 * 访问方式：
 * - 桌面版: http://82.156.213.38/
 * - 移动端: http://82.156.213.38/mobile
 *
 * 代码复用：
 * - hooks/、services/、store/ 完全复用
 * - 页面组件独立开发
 */
