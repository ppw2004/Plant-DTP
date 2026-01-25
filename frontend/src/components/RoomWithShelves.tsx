import { Collapse, Card, Row, Col, Space, Button, Typography, Empty, Tag } from 'antd'
import { PlusOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import type { Room, PlantShelf, Plant } from '../types/api'
import SortableShelfItem from './SortableShelfItem'
import SortablePlantCard from './SortablePlantCard'
import PlantCard from './PlantCard'

const { Panel } = Collapse
const { Text } = Typography

interface RoomWithShelvesProps {
  rooms: Room[]
  shelvesMap: Record<number, PlantShelf[]>
  plantsMap: Record<number, Plant[]>
  onCreateShelf: (roomId: number) => void
  onEditShelf: (shelf: PlantShelf) => void
  onDeleteShelf: (shelfId: number) => void
  onReorderShelves: (roomId: number, shelfIds: number[]) => void
  onCreatePlant: (roomId: number, shelfId?: number) => void
  onEditPlant: (plant: Plant) => void
  onDeletePlant: (plantId: number) => void
  onManageCare: (plant: Plant) => void
  onManageImages?: (plant: Plant) => void
  onReorderPlants: (shelfId: number, plantOrders: { plantId: number; order: number }[]) => void
}

const RoomWithShelves = ({
  rooms,
  shelvesMap,
  plantsMap,
  onCreateShelf,
  onEditShelf,
  onDeleteShelf,
  onReorderShelves,
  onCreatePlant,
  onEditPlant,
  onDeletePlant,
  onManageCare,
  onManageImages,
  onReorderPlants,
}: RoomWithShelvesProps) => {
  const [activeRooms, setActiveRooms] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 获取花架上的植物
  const getShelfPlants = useCallback((shelfId: number): Plant[] => {
    if (!plantsMap[shelfId]) return []
    return plantsMap[shelfId].sort((a, b) => a.shelfOrder - b.shelfOrder)
  }, [plantsMap])

  // 获取房间的所有植物（未分配到花架的）
  const getUnassignedPlants = useCallback((roomId: number): Plant[] => {
    return Object.values(plantsMap)
      .flat()
      .filter((plant) => plant.roomId === roomId && !plant.shelfId)
  }, [plantsMap])

  // 计算花架的网格列数（根据植物数量自适应）
  const getShelfColumns = (plantCount: number): number => {
    if (plantCount === 0) return 1
    if (plantCount <= 2) return 2
    if (plantCount <= 4) return 2
    if (plantCount <= 6) return 3
    if (plantCount <= 9) return 3
    return 4
  }

  // 处理花架拖拽结束
  const handleShelfDragEnd = (roomId: number) => (event: DragEndEvent) => {
    const { active, over } = event

    console.log('Drag event:', { activeId: active.id, overId: over?.id })

    if (over && active.id !== over.id) {
      const shelves = shelvesMap[roomId] || []
      const regularShelves = shelves.filter((s) => !s.isDefault)
      const oldIndex = regularShelves.findIndex((s) => s.id === active.id)
      const newIndex = regularShelves.findIndex((s) => s.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newShelves = arrayMove(regularShelves, oldIndex, newIndex)
        const shelfIds = newShelves.map((s) => s.id)
        console.log('Reordering shelves:', roomId, shelfIds)
        try {
          onReorderShelves(roomId, shelfIds)
        } catch (error) {
          console.error('Error reordering shelves:', error)
        }
      }
    }
  }

  // 处理植物拖拽结束
  const handlePlantDragEnd = (shelfId: number) => (event: DragEndEvent) => {
    const { active, over } = event

    console.log('Drag event:', { activeId: active.id, overId: over?.id })

    if (over && active.id !== over.id) {
      const plants = getShelfPlants(shelfId)
      console.log('Plants on shelf:', shelfId, plants.map((p) => ({ id: p.id, name: p.name })))

      const oldIndex = plants.findIndex((p) => p.id === active.id)
      const newIndex = plants.findIndex((p) => p.id === over.id)

      console.log('Indices:', { oldIndex, newIndex })

      if (oldIndex !== -1 && newIndex !== -1) {
        const newPlants = arrayMove(plants, oldIndex, newIndex)
        const plantOrders = newPlants.map((p, index) => ({ plantId: p.id, order: index }))
        console.log('Reordering plants:', shelfId, plantOrders)
        try {
          onReorderPlants(shelfId, plantOrders)
        } catch (error) {
          console.error('Error reordering plants:', error)
        }
      }
    }
  }

  // 渲染花架面板
  const renderShelfPanel = (room: Room, shelf: PlantShelf, isDefault: boolean) => {
    const plants = getShelfPlants(shelf.id)
    const columns = getShelfColumns(plants.length)

    return (
      <Panel
        key={shelf.id}
        header={
          isDefault ? (
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <span>🏠</span>
                <span>{shelf.name}</span>
                <Tag color="blue">默认</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {plants.length} / {shelf.capacity}
                </Text>
              </Space>
            </Space>
          ) : (
            <SortableShelfItem
              shelf={shelf}
              plantCount={plants.length}
              onEdit={onEditShelf}
              onDelete={onDeleteShelf}
            />
          )
        }
      >
        {plants.length === 0 ? (
          <Empty
            description="花架上还没有植物"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: '20px 0' }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onCreatePlant(room.id, shelf.id)}
            >
              添加植物
            </Button>
          </Empty>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handlePlantDragEnd(shelf.id)}
          >
            <SortableContext
              items={plants.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <Row gutter={[12, 12]}>
                {plants.map((plant) => (
                  <Col
                    key={plant.id}
                    xs={24}
                    sm={columns === 2 ? 12 : columns === 3 ? 8 : 6}
                    md={columns === 2 ? 12 : columns === 3 ? 8 : 6}
                    lg={columns === 2 ? 12 : columns === 3 ? 8 : 6}
                    xl={columns === 2 ? 12 : columns === 3 ? 8 : 6}
                  >
                    <SortablePlantCard
                      plant={plant}
                      onEdit={onEditPlant}
                      onDelete={onDeletePlant}
                      onManageCare={onManageCare}
                      onManageImages={onManageImages}
                    />
                  </Col>
                ))}
              </Row>
            </SortableContext>
          </DndContext>
        )}
      </Panel>
    )
  }

  return (
    <div>
      {rooms.map((room) => {
        const shelves = shelvesMap[room.id] || []
        const unassignedPlants = getUnassignedPlants(room.id)

        // 分离默认花架和普通花架
        const defaultShelf = shelves.find((s) => s.isDefault)
        const regularShelves = shelves.filter((s) => !s.isDefault)

        return (
          <DndContext
            key={room.id}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleShelfDragEnd(room.id)}
          >
            <Card
              style={{ marginBottom: 16 }}
              type="inner"
              title={
                <Space>
                  <span>{room.icon}</span>
                  <span>{room.name}</span>
                  <Tag color={room.color}>{room.locationType}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {shelves.length} 个花架
                  </Text>
                </Space>
              }
              extra={
                <Space>
                  <Button size="small" icon={<PlusOutlined />} onClick={() => onCreateShelf(room.id)}>
                    添加花架
                  </Button>
                  <Button size="small" icon={<PlusOutlined />} onClick={() => onCreatePlant(room.id, defaultShelf?.id)}>
                    添加植物
                  </Button>
                </Space>
              }
            >
              {shelves.length === 0 && unassignedPlants.length === 0 ? (
                <Empty
                  description={
                    <Space direction="vertical">
                      <Text>还没有花架或植物</Text>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => onCreateShelf(room.id)}>
                        创建第一个花架
                      </Button>
                    </Space>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <SortableContext
                  items={regularShelves.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Collapse
                    activeKey={activeRooms}
                    onChange={(keys) => setActiveRooms(keys as string[])}
                    expandIconPosition="end"
                    ghost
                  >
                    {/* 默认花架 */}
                    {defaultShelf && renderShelfPanel(room, defaultShelf, true)}

                    {/* 普通花架 */}
                    {regularShelves.map((shelf) => renderShelfPanel(room, shelf, false))}

                    {unassignedPlants.length > 0 && (
                      <Panel
                        key="unassigned"
                        header={
                          <Space>
                            <ArrowRightOutlined />
                            <span>未分配到花架的植物</span>
                            <Tag>{unassignedPlants.length} 株</Tag>
                          </Space>
                        }
                      >
                        <Row gutter={[12, 12]}>
                          {unassignedPlants.map((plant) => (
                            <Col key={plant.id} xs={12} sm={8} md={6} lg={6}>
                              <PlantCard
                                plant={plant}
                                onEdit={onEditPlant}
                                onDelete={onDeletePlant}
                                onManageCare={onManageCare}
                              />
                            </Col>
                          ))}
                        </Row>
                      </Panel>
                    )}
                  </Collapse>
                </SortableContext>
              )}
            </Card>
          </DndContext>
        )
      })}
    </div>
  )
}

export default RoomWithShelves
