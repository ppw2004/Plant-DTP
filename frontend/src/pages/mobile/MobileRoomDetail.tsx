import { useParams, useNavigate } from 'react-router-dom'
import { Card, Grid, Tabs } from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { useRoom } from '../../hooks/useRooms'
import MobileShelfView from '../../components/mobile/MobileShelfView'

/**
 * 移动端房间详情页
 */
export default function MobileRoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const roomId = Number(id)

  const { data: room, isLoading } = useRoom(roomId)

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        加载中...
      </div>
    )
  }

  if (!room) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>房间不存在</div>
        <button onClick={() => navigate('/mobile/rooms')}>
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* 顶部导航 */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
      }}>
        <LeftOutline onClick={() => navigate('/mobile/rooms')} style={{ fontSize: 24, cursor: 'pointer' }} />
        <div style={{ fontSize: 18, fontWeight: 600 }}>{room.name}</div>
      </div>

      {/* Tab 切换 */}
      <Tabs defaultActiveKey="shelves">
        <Tabs.Tab title="花架视图" key="shelves">
          <MobileShelfView roomId={roomId} />
        </Tabs.Tab>
        <Tabs.Tab title="房间信息" key="info">
          <div style={{ padding: 16 }}>
            {/* 基本信息 */}
            <Card style={{ marginBottom: 16 }}>
              <h2 style={{ margin: '0 0 12px 0', fontSize: 24 }}>{room.name}</h2>
              {room.description && (
                <div style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                  {room.description}
                </div>
              )}

              <Grid columns={1} gap={16}>
                <Grid.Item>
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>植物数量</div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>
                      {room.plantCount || 0}
                    </div>
                  </div>
                </Grid.Item>
              </Grid>
            </Card>

            {/* 描述信息 */}
            {room.description && (
              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>房间描述</div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                  {room.description}
                </div>
              </Card>
            )}

            {/* 创建时间 */}
            {room.createdAt && (
              <Card>
                <div style={{ fontSize: 12, color: '#999' }}>
                  创建时间：{new Date(room.createdAt).toLocaleString('zh-CN')}
                </div>
              </Card>
            )}
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  )
}
