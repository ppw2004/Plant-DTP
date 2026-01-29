import { Card, Grid, Tag } from 'antd-mobile'
import { FolderOutline } from 'antd-mobile-icons'
import { useNavigate } from 'react-router-dom'
import { useRooms } from '../../hooks/useRooms'

/**
 * 移动端房间列表页
 *
 * 功能：
 * - 房间网格展示（2列）
 * - 显示植物数量
 * - 点击进入房间详情
 */
export default function MobileRooms() {
  const navigate = useNavigate()
  const { data } = useRooms()
  const rooms = data?.items || []

  return (
    <div style={{ padding: 16, paddingBottom: 66 }}>
      <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, margin: 0 }}>
        房间列表
      </h3>

      {/* 房间网格 */}
      {rooms && rooms.length > 0 ? (
        <Grid columns={2} gap={16}>
          {rooms.map(room => (
            <Grid.Item key={room.id}>
              <Card
                onClick={() => navigate(`/mobile/rooms/${room.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <FolderOutline fontSize={40} color={room.color || '#1890ff'} />
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginTop: 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {room.name}
                  </div>
                  <Tag color="primary" style={{ marginTop: 8 }}>
                    {room.plantCount || 0} 株植物
                  </Tag>
                </div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 48 }}>🏠</div>
            <div style={{ marginTop: 16 }}>还没有房间，快去创建吧！</div>
          </div>
        </Card>
      )}
    </div>
  )
}
