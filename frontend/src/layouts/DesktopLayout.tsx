import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, theme } from 'antd'
import { HomeOutlined, FolderOutlined, InfoCircleOutlined, CheckCircleOutlined, InboxOutlined, MessageOutlined } from '@ant-design/icons'

const { Header, Content, Sider } = AntLayout

interface DesktopLayoutProps {
  children?: React.ReactNode
}

/**
 * 桌面版布局组件
 *
 * 特点：
 * - 侧边栏导航
 * - 顶部Header
 * - 主内容区域
 */
const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '仪表板' },
    { key: '/rooms', icon: <FolderOutlined />, label: '房间' },
    { key: '/plants', icon: <InfoCircleOutlined />, label: '植物' },
    { key: '/tasks', icon: <CheckCircleOutlined />, label: '任务' },
    { key: '/archive', icon: <InboxOutlined />, label: '归档库' },
    { key: '/suggestions', icon: <MessageOutlined />, label: '留言板' },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: colorBgContainer }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }}>
          <h2 style={{ color: '#fff', textAlign: 'center', marginTop: '20px' }}>🌿 植物管家</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <h1 style={{ padding: '0 24px', margin: '16px 0' }}>植物数字孪生平台</h1>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children || <Outlet />}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default DesktopLayout
