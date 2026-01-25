import { Button, Input, Space, Tag, Empty, Card, Row, Col, message, Popconfirm } from 'antd'
import { ReloadOutlined, SearchOutlined, UndoOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getArchivedPlants, restorePlant, permanentDeletePlant } from '../services/plantService'
import PlantCard from '../components/PlantCard'
import type { Plant } from '../types/api'

const ArchivedPlants = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: plantsData, isLoading, refetch } = useQuery({
    queryKey: ['archivedPlants', search],
    queryFn: () => getArchivedPlants({ search, pageSize: 100 })
  })

  const restoreMutation = useMutation({
    mutationFn: restorePlant,
    onSuccess: () => {
      message.success('植物已恢复')
      queryClient.invalidateQueries({ queryKey: ['archivedPlants'] })
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: permanentDeletePlant,
    onSuccess: () => {
      message.success('植物已永久删除')
      queryClient.invalidateQueries({ queryKey: ['archivedPlants'] })
    }
  })

  const plants = plantsData?.items || []

  const handleRestore = (plant: Plant) => {
    restoreMutation.mutate(plant.id)
  }

  const handlePermanentDelete = (plantId: number) => {
    permanentDeleteMutation.mutate(plantId)
  }

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
          <h2>🗄️ 归档库</h2>
        </Space>
        <Space wrap>
          <Input.Search
            placeholder="搜索植物名称"
            allowClear
            style={{ width: 200 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => setSearch(value)}
            enterButton
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            刷新
          </Button>
        </Space>
      </div>

      {plants.length === 0 && !isLoading ? (
        <Card>
          <Empty
            description={
              search ? '没有找到匹配的归档植物' : '归档库是空的'
            }
            style={{ margin: '40px 0' }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {plants.map((plant) => (
            <Col xs={24} sm={12} lg={8} key={plant.id}>
              <Card
                hoverable
                cover={
                  plant.primaryImage ? (
                    <img
                      alt={plant.name}
                      src={plant.primaryImage.url}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#d9d9d9',
                        fontSize: '48px',
                      }}
                    >
                      🌱
                    </div>
                  )
                }
                extra={
                  <Tag color="default" style={{ marginTop: 8 }}>
                    已归档
                  </Tag>
                }
              >
                <Card.Meta
                  title={plant.name}
                  description={
                    <div>
                      {plant.scientificName && (
                        <div style={{ fontStyle: 'italic', color: '#666', marginBottom: '8px' }}>
                          {plant.scientificName}
                        </div>
                      )}
                      {plant.description && (
                        <div style={{ marginBottom: '12px', minHeight: '40px' }}>
                          {plant.description}
                        </div>
                      )}
                      <Space size="middle">
                        {plant.roomName && (
                          <span>📍 {plant.roomName}</span>
                        )}
                        {plant.purchaseDate && (
                          <span>📅 {new Date(plant.purchaseDate).toLocaleDateString()}</span>
                        )}
                      </Space>
                    </div>
                  }
                />
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <Button
                    type="primary"
                    icon={<UndoOutlined />}
                    onClick={() => handleRestore(plant)}
                    loading={restoreMutation.isPending}
                    style={{ flex: 1 }}
                  >
                    恢复
                  </Button>
                  <Popconfirm
                    title="永久删除植物"
                    description="永久删除后无法恢复，确定要删除吗？"
                    onConfirm={() => handlePermanentDelete(plant.id)}
                    okText="确定"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      loading={permanentDeleteMutation.isPending}
                    >
                      永久删除
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default ArchivedPlants
