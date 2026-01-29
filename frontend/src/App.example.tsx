/**
 * Plant-DTP 双版本路由配置示例
 *
 * 功能：
 * - / (桌面版) - 使用现有代码，Ant Design
 * - /mobile (移动端) - 全新UI，Ant Design Mobile
 * - 自动检测设备，智能跳转
 * - 用户可手动切换版本
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'

// ==================== 布局 ====================
import DesktopLayout from './layouts/DesktopLayout'
import MobileLayout from './layouts/MobileLayout'

// ==================== 桌面版页面 ====================
const DesktopDashboard = lazy(() => import('./pages/desktop/Dashboard'))
const DesktopPlants = lazy(() => import('./pages/desktop/Plants'))
const DesktopRooms = lazy(() => import('./pages/desktop/Rooms'))
const DesktopTasks = lazy(() => import('./pages/desktop/Tasks'))
const DesktopSettings = lazy(() => import('./pages/desktop/Settings'))

// ==================== 移动端页面 ====================
const MobileDashboard = lazy(() => import('./pages/mobile/MobileDashboard'))
const MobilePlants = lazy(() => import('./pages/mobile/MobilePlants'))
const MobileRooms = lazy(() => import('./pages/mobile/MobileRooms'))
const MobileTasks = lazy(() => import('./pages/mobile/MobileTasks'))
const MobileSettings = lazy(() => import('./pages/mobile/MobileSettings'))

// ==================== 加载指示器 ====================
const PageLoading = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
)

// ==================== 主应用 ====================
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* ==================== 桌面版路由 ==================== */}
          <Route path="/" element={<DesktopLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DesktopDashboard />} />
            <Route path="plants" element={<DesktopPlants />} />
            <Route path="plants/:id" element={<DesktopPlantDetail />} />
            <Route path="rooms" element={<DesktopRooms />} />
            <Route path="rooms/:id" element={<DesktopRoomDetail />} />
            <Route path="tasks" element={<DesktopTasks />} />
            <Route path="settings" element={<DesktopSettings />} />

            {/* 桌面版植物详情 */}
            <Route
              path="plants/:id"
              element={
                <lazy(() => import('./pages/desktop/PlantDetail')) />
              }
            />
          </Route>

          {/* ==================== 移动端路由 ==================== */}
          <Route path="/mobile" element={<MobileLayout />}>
            <Route index element={<Navigate to="/mobile/dashboard" replace />} />
            <Route path="dashboard" element={<MobileDashboard />} />
            <Route path="plants" element={<MobilePlants />} />
            <Route path="plants/:id" element={<MobilePlantDetail />} />
            <Route path="rooms" element={<MobileRooms />} />
            <Route path="rooms/:id" element={<MobileRoomDetail />} />
            <Route path="tasks" element={<MobileTasks />} />
            <Route path="settings" element={<MobileSettings />} />

            {/* 移动端植物详情 */}
            <Route
              path="plants/:id"
              element={
                <lazy(() => import('./pages/mobile/MobilePlantDetail')) />
              }
            />
          </Route>

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
                <div style={{ display: 'flex', gap: 16 }}>
                  <a href="/">返回桌面版</a>
                  <a href="/mobile">返回移动端</a>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

/**
 * 使用说明：
 *
 * 1. 桌面版访问：
 *    http://82.156.213.38/
 *    http://82.156.213.38/dashboard
 *    http://82.156.213.38/plants
 *
 * 2. 移动端访问：
 *    http://82.156.213.38/mobile
 *    http://82.156.213.38/mobile/dashboard
 *    http://82.156.213.38/mobile/plants
 *
 * 3. 自动跳转（可选）：
 *    - 检测设备类型
 *    - 手机自动跳转到 /mobile
 *    - 电脑访问 /mobile 可跳转回 /
 *
 * 4. 代码复用：
 *    - API层 (services/) 完全复用
 *    - Hooks (hooks/) 完全复用
 *    - 状态管理 (store/) 完全复用
 *    - UI组件完全独立
 */
