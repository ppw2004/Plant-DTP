import { Card, Tag, Button, Space, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowRightOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Room } from '../types/api'

interface RoomCardProps {
  room: Room
  onEdit: (room: Room) => void
  onDelete: (roomId: number) => void
}

const locationTypeMap: Record<string, { text: string; color: string }> = {
  indoor: { text: '室内', color: 'blue' },
  outdoor: { text: '室外', color: 'green' },
  balcony: { text: '阳台', color: 'orange' },
  greenhouse: { text: '温室', color: 'purple' },
}

const RoomCard = ({ room, onEdit, onDelete }: RoomCardProps) => {
  const navigate = useNavigate()
  const locationInfo = locationTypeMap[room.locationType] || { text: room.locationType, color: 'default' }

  const plantCount = room.plantCount || 0
  const hasPlants = plantCount > 0

  return (
    <Card
      hoverable
      title={
        <Space>
          <span style={{ fontSize: '20px' }}>{room.icon}</span>
          <span>{room.name}</span>
        </Space>
      }
      extra={<Tag color={locationInfo.color}>{locationInfo.text}</Tag>}
      actions={[
        <Button
          key="view"
          type="text"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate(`/plants?roomId=${room.id}`)}
        >
          查看植物
        </Button>,
        <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => onEdit(room)}>
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="删除房间"
          description={
            hasPlants
              ? `该房间下还有 ${plantCount} 株植物，删除房间前需要先处理这些植物。`
              : '确定要删除这个房间吗？'
          }
          icon={hasPlants ? <ExclamationCircleOutlined /> : undefined}
          okText="确定"
          cancelText="取消"
          okButtonProps={hasPlants ? { danger: true } : undefined}
          onConfirm={() => onDelete(room.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ]}
    >
      <p style={{ color: '#666', minHeight: '40px', margin: 0 }}>
        {room.description || '暂无描述'}
      </p>
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
        <Space>
          <span>植物数量: </span>
          <span style={{ fontWeight: 'bold', color: plantCount > 0 ? '#52c41a' : '#999' }}>
            {plantCount}
          </span>
        </Space>
      </div>
    </Card>
  )
}

export default RoomCard
