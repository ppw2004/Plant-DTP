import { Button, Space, Select, Empty, Card } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useRooms } from '../hooks/useRooms'
import { useDeleteRoom } from '../hooks/useRooms'
import { useUIStore } from '../store/uiStore'
import RoomCard from '../components/RoomCard'
import RoomFormModal from '../components/RoomFormModal'
import type { Room, LocationType } from '../types/api'

const LOCATION_OPTIONS = [
  { label: '全部', value: null },
  { label: '室内', value: 'indoor' },
  { label: '室外', value: 'outdoor' },
  { label: '阳台', value: 'balcony' },
  { label: '温室', value: 'greenhouse' },
]

const Rooms = () => {
  const { roomLocationFilter, setRoomLocationFilter, openRoomModal } = useUIStore()
  const { data: roomsData, isLoading, refetch } = useRooms({ pageSize: 100 })
  const deleteRoom = useDeleteRoom()

  const rooms = roomsData?.items || []

  const handleEdit = (room: Room) => {
    openRoomModal(room.id)
  }

  const handleDelete = (roomId: number) => {
    deleteRoom.mutate(roomId)
  }

  const filteredRooms = roomLocationFilter
    ? rooms.filter((room) => room.locationType === roomLocationFilter)
    : rooms

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h2>我的房间</h2>
        <Space>
          <Select
            style={{ width: 120 }}
            value={roomLocationFilter}
            onChange={(value) => setRoomLocationFilter(value as LocationType | null)}
            options={LOCATION_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value as LocationType | null,
            }))}
            placeholder="筛选类型"
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoomModal()}>
            添加房间
          </Button>
        </Space>
      </div>

      {filteredRooms.length === 0 && !isLoading ? (
        <Card>
          <Empty
            description={rooms.length === 0 ? '还没有房间，创建第一个房间吧！' : '没有符合条件的房间'}
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <RoomFormModal />
    </div>
  )
}

export default Rooms
