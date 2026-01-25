import { useEffect, useState } from 'react'
import { Card, List, Tag, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

interface Room {
  id: number
  name: string
  description: string
  locationType: string
  icon: string
  color: string
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:12801/api/v1/rooms/')
      .then(res => res.json())
      .then(data => {
        setRooms(data.data.items)
        setLoading(false)
      })
      .catch(err => {
        console.error('获取房间列表失败:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>我的房间</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          添加房间
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 2 }}
        loading={loading}
        dataSource={rooms}
        renderItem={(room) => (
          <List.Item>
            <Card
              title={
                <span>
                  {room.icon} {room.name}
                </span>
              }
              extra={<Tag color={room.color}>{room.locationType}</Tag>}
            >
              <p>{room.description || '暂无描述'}</p>
              <p>植物数量: 0</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  )
}

export default Rooms
