import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuOutlined } from '@ant-design/icons'
import { Space, Typography, Button } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { PlantShelf } from '../types/api'

const { Text } = Typography

interface SortableShelfItemProps {
  shelf: PlantShelf
  plantCount: number
  onEdit: (shelf: PlantShelf) => void
  onDelete: (shelfId: number) => void
  isDragging?: boolean
}

const SortableShelfItem = ({
  shelf,
  plantCount,
  onEdit,
  onDelete,
  isDragging = false,
}: SortableShelfItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: shelf.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <div
            style={{ cursor: 'grab', padding: '4px' }}
            {...listeners}
            onMouseDown={(e) => {
              e.preventDefault()
            }}
          >
            <MenuOutlined />
          </div>
          <span>{shelf.name}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {plantCount} / {shelf.capacity}
          </Text>
        </Space>
        <Space>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(shelf)
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(shelf.id)
            }}
          >
            删除
          </Button>
        </Space>
      </Space>
    </div>
  )
}

export default SortableShelfItem
