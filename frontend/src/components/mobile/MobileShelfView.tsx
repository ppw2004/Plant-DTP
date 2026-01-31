import { useState, useEffect } from 'react'
import { Card, Button, Modal, Input, Toast, Space, Dialog, Tag } from 'antd-mobile'
import { AddOutline, DeleteOutline, EditSOutline } from 'antd-mobile-icons'
import { useShelves } from '../../hooks/useShelves'
import api from '../../services/api'
import { movePlantToShelf } from '../../services/shelfService'
import type { PlantShelf, Plant, PlantConfig } from '../../types/api'
import dayjs from 'dayjs'

interface MobileShelfViewProps {
  roomId: number
}

export default function MobileShelfView({ roomId }: MobileShelfViewProps) {
  const [shelfModalVisible, setShelfModalVisible] = useState(false)
  const [shelfName, setShelfName] = useState('')
  const [editingShelf, setEditingShelf] = useState<PlantShelf | null>(null)
  const [moveModalVisible, setMoveModalVisible] = useState(false)
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [shelvesWithPlants, setShelvesWithPlants] = useState<PlantShelf[]>([])
  const [loadingPlants, setLoadingPlants] = useState(true)
  const [plantConfigs, setPlantConfigs] = useState<Record<number, PlantConfig[]>>({})

  const { shelves, isLoading, createShelf, updateShelf, deleteShelf } = useShelves(roomId)

  // 加载每个花架的植物数据
  useEffect(() => {
    const loadShelfPlants = async () => {
      if (!shelves || shelves.length === 0) {
        setLoadingPlants(false)
        return
      }

      setLoadingPlants(true)
      try {
        const shelvesData = await Promise.all(
          shelves.map(async (shelf) => {
            const response = await api.get<{ data: PlantShelf }>(`/shelves/${shelf.id}`)
            return response.data.data
          })
        )
        setShelvesWithPlants(shelvesData)

        // 加载所有植物的养护配置
        const allPlants = shelvesData.flatMap(s => s.plants || [])
        const configPromises = allPlants.map(async (plant) => {
          try {
            const response = await api.get<{ data: { items: PlantConfig[] } }>(`/plants/${plant.id}/configs`)
            return { plantId: plant.id, configs: response.data.data.items }
          } catch {
            return { plantId: plant.id, configs: [] }
          }
        })

        const configsData = await Promise.all(configPromises)
        const configsMap: Record<number, PlantConfig[]> = {}
        configsData.forEach(({ plantId, configs }) => {
          configsMap[plantId] = configs
        })
        setPlantConfigs(configsMap)
      } catch (error) {
        console.error('Failed to load shelf plants:', error)
        setShelvesWithPlants(shelves)
      } finally {
        setLoadingPlants(false)
      }
    }

    loadShelfPlants()
  }, [shelves])

  // 检查植物的养护任务是否进入窗口期
  const isInWindowPeriod = (plant: Plant): boolean => {
    const configs = plantConfigs[plant.id] || []
    const now = dayjs()

    return configs.some(config => {
      if (!config.isActive || !config.nextDueAt) return false

      const nextDue = dayjs(config.nextDueAt)
      const windowStart = nextDue.subtract(config.windowPeriod || 0, 'day')

      return now.isAfter(windowStart) && now.isBefore(nextDue.add(1, 'day'))
    })
  }

  // 获取植物的紧急任务信息
  const getUrgentTaskInfo = (plant: Plant): string | null => {
    const configs = plantConfigs[plant.id] || []
    const now = dayjs()

    const urgentConfig = configs.find(config => {
      if (!config.isActive || !config.nextDueAt) return false
      const nextDue = dayjs(config.nextDueAt)
      const windowStart = nextDue.subtract(config.windowPeriod || 0, 'day')
      return now.isAfter(windowStart) && now.isBefore(nextDue.add(1, 'day'))
    })

    return urgentConfig ? `${urgentConfig.taskTypeName}` : null
  }

  // 获取指定花架的植物
  const getShelfPlants = (shelfId: number | null): Plant[] => {
    if (shelfId === null) {
      return []
    }
    const shelf = shelvesWithPlants.find(s => s.id === shelfId)
    return shelf?.plants || []
  }

  // 未分配到花架的植物
  const unassignedPlants: Plant[] = []
  // 默认花架
  const defaultShelf = shelvesWithPlants.find(s => s.isDefault)
  // 其他花架
  const customShelves = shelvesWithPlants.filter(s => !s.isDefault)

  // 添加花架
  const handleAddShelf = () => {
    setEditingShelf(null)
    setShelfName('')
    setShelfModalVisible(true)
  }

  // 编辑花架
  const handleEditShelf = (shelf: PlantShelf) => {
    setEditingShelf(shelf)
    setShelfName(shelf.name)
    setShelfModalVisible(true)
  }

  // 保存花架
  const handleSaveShelf = () => {
    if (!shelfName.trim()) {
      Toast.show({ content: '请输入花架名称' })
      return
    }

    if (editingShelf) {
      updateShelf({ shelfId: editingShelf.id, data: { name: shelfName } })
    } else {
      createShelf({ roomId, data: { name: shelfName } })
    }
    setShelfModalVisible(false)
    setShelfName('')
  }

  // 删除花架
  const handleDeleteShelf = (shelf: PlantShelf) => {
    Dialog.confirm({
      content: '删除花架后，该花架上的植物将变为未分配状态。确定删除吗？',
      onConfirm: () => {
        deleteShelf(shelf.id)
      }
    })
  }

  // 打开移动植物弹窗
  const handleMovePlant = (plant: Plant) => {
    setSelectedPlant(plant)
    setMoveModalVisible(true)
  }

  // 移动植物到指定位置
  const handleMoveToShelf = async (shelfId: number | null) => {
    if (!selectedPlant) return

    try {
      await movePlantToShelf(selectedPlant.id, shelfId)
      Toast.show({ content: '移动成功', icon: 'success' })
      setMoveModalVisible(false)
      setSelectedPlant(null)
      // 刷新页面数据
      window.location.reload()
    } catch (error) {
      console.error('Move failed:', error)
      Toast.show({ content: '移动失败' })
    }
  }

  // 上移植物
  const handleMoveUp = async (plant: Plant, shelfId: number | null) => {
    const shelfPlants = getShelfPlants(shelfId)
    const currentIndex = shelfPlants.findIndex((p: Plant) => p.id === plant.id)

    if (currentIndex <= 0) return

    const targetPlant = shelfPlants[currentIndex - 1]

    try {
      await movePlantToShelf(plant.id, shelfId, targetPlant.shelfOrder)
      await movePlantToShelf(targetPlant.id, shelfId, plant.shelfOrder)
      Toast.show({ content: '移动成功', icon: 'success' })
      window.location.reload()
    } catch (error) {
      console.error('Move up failed:', error)
      Toast.show({ content: '移动失败' })
    }
  }

  // 下移植物
  const handleMoveDown = async (plant: Plant, shelfId: number | null) => {
    const shelfPlants = getShelfPlants(shelfId)
    const currentIndex = shelfPlants.findIndex((p: Plant) => p.id === plant.id)

    if (currentIndex >= shelfPlants.length - 1) return

    const targetPlant = shelfPlants[currentIndex + 1]

    try {
      await movePlantToShelf(plant.id, shelfId, targetPlant.shelfOrder)
      await movePlantToShelf(targetPlant.id, shelfId, plant.shelfOrder)
      Toast.show({ content: '移动成功', icon: 'success' })
      window.location.reload()
    } catch (error) {
      console.error('Move down failed:', error)
      Toast.show({ content: '移动失败' })
    }
  }

  // 渲染花架
  const renderShelf = (shelf: PlantShelf | null, plants: Plant[], isDefault: boolean = false) => {
    if (plants.length === 0 && !isDefault) return null

    return (
      <Card
        key={shelf?.id || 'unassigned'}
        style={{ margin: '0 16px 16px' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{shelf?.name || '未分配'}</span>
            {shelf && !shelf.isDefault && (
              <Space>
                <Button
                  size="mini"
                  fill="none"
                  onClick={() => handleEditShelf(shelf)}
                >
                  <EditSOutline />
                </Button>
                <Button
                  size="mini"
                  fill="none"
                  color="danger"
                  onClick={() => handleDeleteShelf(shelf)}
                >
                  <DeleteOutline />
                </Button>
              </Space>
            )}
          </div>
        }
      >
        {plants.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#999' }}>
            暂无植物
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {plants.map((plant: Plant, index: number) => (
              <div
                key={plant.id}
                onClick={() => {
                  window.location.href = `/mobile/plants/${plant.id}`
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  border: '1px solid #e8e8e8',
                  cursor: 'pointer',
                }}
              >
                {/* 缩略图 - 使用第一张图片 */}
                {/* TODO: 需要从 PlantImage 获取图片，暂时用占位符 */}
                <div
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: '#ddd',
                    borderRadius: 4,
                    marginRight: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                  }}
                >
                  🌱
                </div>

                {/* 植物信息 */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{plant.name}</span>
                    {/* 养护任务窗口期标记 */}
                    {isInWindowPeriod(plant) && (
                      <Tag
                        round
                        style={{ fontSize: 10, padding: '0 6px' }}
                      >
                        {getUrgentTaskInfo(plant)}
                      </Tag>
                    )}
                  </div>
                  {plant.scientificName && (
                    <div style={{ fontSize: 12, color: '#999' }}>{plant.scientificName}</div>
                  )}
                </div>

                {/* 操作按钮 */}
                <Space onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="mini"
                    fill="outline"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(plant, shelf?.id || null)}
                  >
                    ↑
                  </Button>
                  <Button
                    size="mini"
                    fill="outline"
                    disabled={index === plants.length - 1}
                    onClick={() => handleMoveDown(plant, shelf?.id || null)}
                  >
                    ↓
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    fill="outline"
                    onClick={() => handleMovePlant(plant)}
                  >
                    移动
                  </Button>
                </Space>
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  }

  if (isLoading || loadingPlants) {
    return <div style={{ padding: 20, textAlign: 'center' }}>加载中...</div>
  }

  return (
    <div>
      {/* 添加花架按钮 */}
      <div style={{ padding: '16px', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 100 }}>
        <Button
          block
          color="primary"
          onClick={handleAddShelf}
        >
          <AddOutline style={{ marginRight: 8 }} />
          添加花架
        </Button>
      </div>

      {/* 自定义花架 */}
      {customShelves.map((shelf) => renderShelf(shelf, getShelfPlants(shelf.id)))}

      {/* 默认花架 */}
      {defaultShelf && renderShelf(defaultShelf, getShelfPlants(defaultShelf.id), true)}

      {/* 未分配的植物 */}
      {unassignedPlants.length > 0 && renderShelf(null, unassignedPlants, true)}

      {/* 添加/编辑花架弹窗 */}
      <Modal
        visible={shelfModalVisible}
        content={
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              {editingShelf ? '编辑花架' : '添加花架'}
            </div>
            <Input
              placeholder="请输入花架名称"
              value={shelfName}
              onChange={setShelfName}
            />
          </div>
        }
        closeOnMaskClick
        onClose={() => setShelfModalVisible(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
          },
          {
            key: 'confirm',
            text: '确定',
            primary: true,
            onClick: handleSaveShelf,
          },
        ]}
      />

      {/* 移动植物弹窗 */}
      <Modal
        visible={moveModalVisible}
        content={
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              移动到
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button
                block
                onClick={() => handleMoveToShelf(null)}
              >
                未分配
              </Button>
              {customShelves.map((shelf) => (
                <Button
                  key={shelf.id}
                  block
                  onClick={() => handleMoveToShelf(shelf.id)}
                >
                  {shelf.name}
                </Button>
              ))}
              {defaultShelf && (
                <Button
                  block
                  onClick={() => handleMoveToShelf(defaultShelf.id)}
                >
                  {defaultShelf.name}
                </Button>
              )}
            </div>
          </div>
        }
        closeOnMaskClick
        onClose={() => setMoveModalVisible(false)}
      />
    </div>
  )
}
