import { Button, Input, Select, Space, Tag, Empty, Card, Row, Col, Switch, message } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePlants } from '../hooks/usePlants'
import { useDeletePlant } from '../hooks/usePlants'
import { useRooms } from '../hooks/useRooms'
import { useUIStore } from '../store/uiStore'
import PlantCard from '../components/PlantCard'
import PlantFormModal from '../components/PlantFormModal'
import PlantCareModal from '../components/PlantCareModal'
import ImageUpload from '../components/ImageUpload'
import RoomWithShelves from '../components/RoomWithShelves'
import ShelfFormModal from '../components/ShelfFormModal'
import { createShelf } from '../services/shelfService'
import { reorderShelves, reorderPlantsOnShelf } from '../services/shelfService'
import type { Plant, PlantShelf, HealthStatus } from '../types/api'

const HEALTH_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '健康', value: 'healthy' },
  { label: '需要关注', value: 'needs_attention' },
  { label: '紧急', value: 'critical' },
]

const Plants = () => {
  const queryClient = useQueryClient()
  const [careModalVisible, setCareModalVisible] = useState(false)
  const [careModalPlant, setCareModalPlant] = useState<{ id: number; name: string } | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'shelf'>('grid')
  const [shelfModalVisible, setShelfModalVisible] = useState(false)
  const [shelfModalRoomId, setShelfModalRoomId] = useState<number | null>(null)
  const [editingShelf, setEditingShelf] = useState<PlantShelf | null>(null)

  const {
    plantFilters,
    setPlantFilters,
    clearPlantFilters,
    openPlantModal,
    openImageModal,
    imageModalVisible,
    imageModalPlantId,
    closeImageModal,
  } = useUIStore()

  const { data: plantsData, isLoading, refetch } = usePlants({
    search: plantFilters.search || undefined,
    roomId: plantFilters.roomId || undefined,
    healthStatus: plantFilters.healthStatus || undefined,
    pageSize: 100,
  })
  const deletePlant = useDeletePlant()
  const { data: roomsData } = useRooms({ pageSize: 100 })

  const plants = plantsData?.items || []
  const rooms = roomsData?.items || []

  // 获取所有房间的花架数据
  const [shelvesMap, setShelvesMap] = useState<Record<number, any[]>>({})
  const [plantsMap, setPlantsMap] = useState<Record<number, Plant[]>>({})

  // 加载花架数据 - 使用 ref 避免依赖 rooms 导致的循环
  const loadShelves = useCallback(async (roomsToLoad: typeof rooms) => {
    if (!roomsToLoad || roomsToLoad.length === 0) {
      return
    }

    const shelvesData: Record<number, any[]> = {}
    const plantsData: Record<number, Plant[]> = {}

    for (const room of roomsToLoad) {
      try {
        const { getShelves, getShelf } = await import('../services/shelfService')
        const shelves = await getShelves(room.id)
        shelvesData[room.id] = shelves.items

        // 获取每个花架的植物
        for (const shelf of shelves.items) {
          const shelfDetail = await getShelf(shelf.id)
          plantsData[shelf.id] = shelfDetail.plants || []
        }
      } catch (error) {
        console.error('Failed to load shelves:', error)
      }
    }

    setShelvesMap(shelvesData)
    setPlantsMap(plantsData)
  }, []) // 空依赖数组，函数只创建一次

  // 组件挂载时加载花架数据
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      loadShelves(rooms)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms?.length]) // 只在房间数量变化时重新加载，忽略loadShelves依赖

  const hasActiveFilters =
    plantFilters.search ||
    plantFilters.roomId ||
    plantFilters.healthStatus

  const handleEdit = (plant: Plant) => {
    openPlantModal(plant.id)
  }

  const handleDelete = (plantId: number) => {
    deletePlant.mutate(plantId)
  }

  const handleManageCare = (plant: Plant) => {
    setCareModalPlant({ id: plant.id, name: plant.name })
    setCareModalVisible(true)
  }

  const handleManageImages = (plant: Plant) => {
    openImageModal(plant.id)
  }

  const handleSearch = (value: string) => {
    setPlantFilters({ search: value || undefined })
  }

  const handleRoomFilterChange = (value: string | number) => {
    setPlantFilters({ roomId: value === '' ? undefined : Number(value) })
  }

  const handleHealthFilterChange = (value: string) => {
    setPlantFilters({ healthStatus: value === '' ? undefined : (value as HealthStatus) })
  }

  const handleClearFilters = () => {
    clearPlantFilters()
  }

  // 处理花架重新排序
  const handleReorderShelves = async (roomId: number, shelfIds: number[]) => {
    try {
      await reorderShelves(roomId, shelfIds)
      message.success('花架排序已更新')
      await loadShelves(rooms)
    } catch (error) {
      message.error('排序失败')
      console.error('Failed to reorder shelves:', error)
    }
  }

  // 处理植物重新排序
  const handleReorderPlants = async (shelfId: number, plantOrders: { plantId: number; order: number }[]) => {
    try {
      console.log('Sending reorder request:', { shelfId, plantOrders })
      const result = await reorderPlantsOnShelf(shelfId, plantOrders)
      console.log('Reorder response:', result)
      message.success('植物排序已更新')
      await loadShelves(rooms)
      queryClient.invalidateQueries({ queryKey: ['plants'] })
    } catch (error) {
      message.error('排序失败')
      console.error('Failed to reorder plants:', error)
    }
  }

  // 处理创建花架
  const handleCreateShelf = (roomId: number) => {
    setShelfModalRoomId(roomId)
    setEditingShelf(null)
    setShelfModalVisible(true)
  }

  // 处理编辑花架
  const handleEditShelf = (shelf: PlantShelf) => {
    setShelfModalRoomId(shelf.roomId)
    setEditingShelf(shelf)
    setShelfModalVisible(true)
  }

  // 处理删除花架
  const handleDeleteShelf = async (shelfId: number) => {
    // TODO: 实现删除功能
    console.log('Delete shelf:', shelfId)
  }

  // 提交花架表单
  const handleSubmitShelf = async (data: { name: string; description: string; capacity: number }) => {
    if (!shelfModalRoomId) return

    try {
      await createShelf(shelfModalRoomId, data)
      message.success('花架创建成功')
      await loadShelves(rooms)
    } catch (error) {
      message.error('创建失败')
      console.error('Failed to create shelf:', error)
    }
  }

  const roomOptions = [
    { label: '全部房间', value: '' },
    ...rooms.map((room) => ({
      label: `${room.icon} ${room.name}`,
      value: room.id,
    })),
  ]

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
        <Space>
          <h2>我的植物</h2>
          <Switch
            checked={viewMode === 'shelf'}
            onChange={(checked) => setViewMode(checked ? 'shelf' : 'grid')}
            checkedChildren="花架视图"
            unCheckedChildren="网格视图"
          />
        </Space>
        <Space wrap>
          <Input.Search
            placeholder="搜索植物名称"
            allowClear
            style={{ width: 200 }}
            value={plantFilters.search}
            onChange={(e) => setPlantFilters({ search: e.target.value || undefined })}
            onSearch={handleSearch}
            enterButton
          />
          <Select
            style={{ width: 150 }}
            value={plantFilters.roomId ?? ''}
            onChange={handleRoomFilterChange}
            options={roomOptions}
            placeholder="筛选房间"
          />
          <Select
            style={{ width: 130 }}
            value={plantFilters.healthStatus ?? ''}
            onChange={handleHealthFilterChange}
            options={HEALTH_STATUS_OPTIONS}
            placeholder="健康状态"
          />
          {hasActiveFilters && (
            <Button onClick={handleClearFilters}>清除筛选</Button>
          )}
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openPlantModal()}>
            添加植物
          </Button>
        </Space>
      </div>

      {hasActiveFilters && (
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {plantFilters.search && (
              <Tag
                closable
                onClose={() => setPlantFilters({ search: undefined })}
                icon={<SearchOutlined />}
              >
                搜索: {plantFilters.search}
              </Tag>
            )}
            {plantFilters.roomId && (
              <Tag
                closable
                onClose={() => setPlantFilters({ roomId: undefined })}
              >
                房间: {rooms.find((r) => r.id === plantFilters.roomId)?.name}
              </Tag>
            )}
            {plantFilters.healthStatus && (
              <Tag
                closable
                onClose={() => setPlantFilters({ healthStatus: undefined })}
              >
                状态:{HEALTH_STATUS_OPTIONS.find((opt) => opt.value === plantFilters.healthStatus)?.label}
              </Tag>
            )}
          </Space>
        </div>
      )}

      {viewMode === 'grid' ? (
        <>
          {plants.length === 0 && !isLoading ? (
            <Card>
              <Empty
                description={hasActiveFilters ? '没有符合条件的植物' : '还没有植物，添加第一株植物吧！'}
              />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {plants.map((plant) => (
                <Col xs={24} sm={12} lg={8} key={plant.id}>
                  <PlantCard
                    plant={plant}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onManageCare={handleManageCare}
                    onManageImages={handleManageImages}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      ) : (
        <RoomWithShelves
          rooms={rooms}
          shelvesMap={shelvesMap}
          plantsMap={plantsMap}
          onCreateShelf={handleCreateShelf}
          onEditShelf={handleEditShelf}
          onDeleteShelf={handleDeleteShelf}
          onReorderShelves={handleReorderShelves}
          onCreatePlant={(_roomId, shelfId) => {
            if (shelfId) {
              // 从花架添加植物 - 暂时还是打开普通表单，后端会自动分配到默认花架
              openPlantModal()
            } else {
              openPlantModal()
            }
          }}
          onEditPlant={handleEdit}
          onDeletePlant={handleDelete}
          onManageCare={handleManageCare}
          onManageImages={handleManageImages}
          onReorderPlants={handleReorderPlants}
        />
      )}

      <PlantFormModal />

      {careModalPlant && (
        <PlantCareModal
          visible={careModalVisible}
          plant={careModalPlant}
          onClose={() => setCareModalVisible(false)}
        />
      )}

      <ShelfFormModal
        visible={shelfModalVisible}
        onClose={() => setShelfModalVisible(false)}
        onSubmit={handleSubmitShelf}
        initialValue={editingShelf ? {
          name: editingShelf.name,
          description: editingShelf.description || '',
          capacity: editingShelf.capacity
        } : undefined}
      />

      <ImageUpload
        visible={imageModalVisible}
        onClose={closeImageModal}
        plantId={imageModalPlantId!}
      />
    </div>
  )
}

export default Plants
