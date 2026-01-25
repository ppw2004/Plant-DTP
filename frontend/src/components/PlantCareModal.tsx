import { Modal, List, Tag, Space, Button, Empty, Spin, Popconfirm } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { usePlantConfigs } from '../hooks/usePlantConfigs'
import PlantConfigModal from './PlantConfigModal'
import type { PlantConfig, PlantConfigFormData } from '../types/api'

interface PlantCareModalProps {
  visible: boolean
  plant: { id: number; name: string }
  onClose: () => void
}

const PlantCareModal = ({ visible, plant, onClose }: PlantCareModalProps) => {
  const { configs, isLoading, createConfig, updateConfig, deleteConfig, completeTask } =
    usePlantConfigs(plant.id)

  const [configModalVisible, setConfigModalVisible] = React.useState(false)
  const [editingConfig, setEditingConfig] = React.useState<PlantConfig | undefined>()

  const handleAddConfig = () => {
    setEditingConfig(undefined)
    setConfigModalVisible(true)
  }

  const handleEditConfig = (config: PlantConfig) => {
    setEditingConfig(config)
    setConfigModalVisible(true)
  }

  const handleConfigModalOk = (data: PlantConfigFormData) => {
    if (editingConfig) {
      updateConfig({ configId: editingConfig.id, data })
    } else {
      createConfig(data)
    }
    setConfigModalVisible(false)
  }

  const handleDeleteConfig = (configId: number) => {
    deleteConfig(configId)
  }

  const handleCompleteTask = (config: PlantConfig) => {
    completeTask({ configId: config.id })
  }

  return (
    <>
      <Modal
        title={`${plant.name} - 养护配置`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: '16px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddConfig} block>
            添加养护任务
          </Button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : configs.length === 0 ? (
          <Empty
            description="暂无养护配置"
            style={{ padding: '40px 0' }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={configs}
            renderItem={(config) => (
              <List.Item
                actions={[
                  config.isActive && (
                    <Button
                      type="text"
                      icon={<CheckOutlined />}
                      onClick={() => handleCompleteTask(config)}
                    >
                      完成
                    </Button>
                  ),
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditConfig(config)}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    title="删除配置"
                    description="确定要删除这个养护配置吗？"
                    onConfirm={() => handleDeleteConfig(config.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{config.taskTypeName}</span>
                      <Tag color={config.isActive ? 'success' : 'default'}>
                        {config.isActive ? '启用' : '禁用'}
                      </Tag>
                      {config.season && (
                        <Tag color="blue">
                          {
                            {
                              spring: '春季',
                              summer: '夏季',
                              autumn: '秋季',
                              winter: '冬季',
                            }[config.season]
                          }
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <div>间隔天数：每 {config.intervalDays} 天</div>
                      {config.nextDueAt && (
                        <div>
                          <CalendarOutlined /> 下次到期：{' '}
                          {dayjs(config.nextDueAt).format('YYYY-MM-DD')}
                        </div>
                      )}
                      {config.lastDoneAt && (
                        <div>
                          上次完成：{dayjs(config.lastDoneAt).format('YYYY-MM-DD')}
                        </div>
                      )}
                      {config.notes && <div style={{ color: '#666' }}>{config.notes}</div>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      <PlantConfigModal
        visible={configModalVisible}
        plantId={plant.id}
        plantName={plant.name}
        config={editingConfig}
        onCancel={() => setConfigModalVisible(false)}
        onOk={handleConfigModalOk}
      />
    </>
  )
}

import React from 'react'

export default PlantCareModal
