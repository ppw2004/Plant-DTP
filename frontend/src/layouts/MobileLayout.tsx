import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
  PieOutline,
} from 'antd-mobile-icons'
import { useEffect, useState } from 'react'

// 不显示TabBar的路由
const TAB_BAR_ROUTES = ['/mobile', '/mobile/dashboard', '/mobile/plants', '/mobile/rooms', '/mobile/tasks']

/**
 * 移动端布局组件
 *
 * 特点：
 * - 底部TabBar导航
 * - 顶部标题栏（非首页显示）
 * - 全屏布局
 * - 触摸优化
 */
export default function MobileLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeKey, setActiveKey] = useState('dashboard')

  // 根据路由设置当前Tab
  useEffect(() => {
    const path = location.pathname
    if (path === '/mobile' || path.startsWith('/mobile/dashboard')) setActiveKey('dashboard')
    else if (path.startsWith('/mobile/plants')) setActiveKey('plants')
    else if (path.startsWith('/mobile/rooms')) setActiveKey('rooms')
    else if (path.startsWith('/mobile/tasks')) setActiveKey('tasks')
  }, [location.pathname])

  const tabs = [
    {
      key: 'dashboard',
      title: '首页',
      icon: <AppOutline />,
      path: '/mobile',
    },
    {
      key: 'plants',
      title: '植物',
      icon: <UnorderedListOutline />,
      path: '/mobile/plants',
    },
    {
      key: 'rooms',
      title: '房间',
      icon: <PieOutline />,
      path: '/mobile/rooms',
    },
    {
      key: 'tasks',
      title: '任务',
      icon: <UserOutline />,
      path: '/mobile/tasks',
    },
  ]

  // 某些页面隐藏TabBar（如详情页）
  const hideTabBar = !TAB_BAR_ROUTES.includes(location.pathname)

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      {/* 顶部标题栏（首页不显示） */}
      {location.pathname !== '/mobile' && location.pathname !== '/mobile/dashboard' && (
        <div style={{
          height: 44,
          backgroundColor: '#fff',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 600,
        }}>
          {tabs.find(tab => tab.key === activeKey)?.title}
        </div>
      )}

      {/* 主内容区域 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        paddingBottom: hideTabBar ? 0 : 50, // 为TabBar留出空间
        WebkitOverflowScrolling: 'touch', // iOS平滑滚动
      }}>
        <Outlet />
      </div>

      {/* 底部TabBar */}
      {!hideTabBar && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
          zIndex: 1000,
        }}>
          <TabBar
            activeKey={activeKey}
            onChange={(key) => {
              const tab = tabs.find(t => t.key === key)
              if (tab) navigate(tab.path)
            }}
            safeArea
          >
            {tabs.map(tab => (
              <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
            ))}
          </TabBar>
        </div>
      )}
    </div>
  )
}
