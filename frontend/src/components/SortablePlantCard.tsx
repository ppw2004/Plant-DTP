import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuOutlined } from '@ant-design/icons'
import { Space } from 'antd'
import PlantCard from './PlantCard'
import type { Plant } from '../types/api'

interface SortablePlantCardProps {
  plant: Plant
  onEdit: (plant: Plant) => void
  onDelete: (plantId: number) => void
  onManageCare: (plant: Plant) => void
  onManageImages?: (plant: Plant) => void
}

const SortablePlantCard = ({
  plant,
  onEdit,
  onDelete,
  onManageCare,
  onManageImages,
}: SortablePlantCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plant.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    height: '100%',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        <div
          style={{ cursor: 'grab', textAlign: 'center', color: '#999', fontSize: '12px' }}
          {...listeners}
          {...attributes}
          onMouseDown={(e) => {
            e.preventDefault()
          }}
        >
          <MenuOutlined />
        </div>
        <div style={{ height: 'calc(100% - 24px)' }}>
          <PlantCard
            plant={plant}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageCare={onManageCare}
            onManageImages={onManageImages}
          />
        </div>
      </Space>
    </div>
  )
}

export default SortablePlantCard
