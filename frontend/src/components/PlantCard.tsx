import { Card, Tag, Button, Space, Popconfirm, Image } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import PlantTaskProgress from './PlantTaskProgress'
import type { Plant } from '../types/api'

interface PlantCardProps {
  plant: Plant
  onEdit: (plant: Plant) => void
  onDelete: (plantId: number) => void
  onManageCare?: (plant: Plant) => void
  onManageImages?: (plant: Plant) => void
}

const healthStatusMap: Record<string, { text: string; color: string }> = {
  healthy: { text: '健康', color: 'success' },
  needs_attention: { text: '需要关注', color: 'warning' },
  critical: { text: '紧急', color: 'error' },
}

const PlantCard = ({ plant, onEdit, onDelete, onManageCare, onManageImages }: PlantCardProps) => {
  const healthInfo = healthStatusMap[plant.healthStatus] || {
    text: plant.healthStatus,
    color: 'default',
  }

  const imageCount = plant.imageCount || 0
  const hasImages = imageCount > 0

  const defaultImage = (
    <div
      style={{
        width: '100%',
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

  return (
    <Card
      hoverable
      cover={
        plant.primaryImage ? (
          <Image
            src={plant.primaryImage.url}
            alt={plant.name}
            style={{ height: '140px', objectFit: 'contain' }}
            preview={true}
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Crect width='140' height='140' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='32'%3E🌱%3C/text%3E%3C/svg%3E"
          />
        ) : (
          defaultImage
        )
      }
      extra={
        <Tag color={healthInfo.color} icon={<HeartOutlined />}>
          {healthInfo.text}
        </Tag>
      }
      actions={[
        ...(onManageCare
          ? [
              <Button key="care" type="text" onClick={() => onManageCare(plant)}>
                养护
              </Button>,
            ]
          : []),
        ...(onManageImages
          ? [
              <Button key="images" type="text" icon={<PictureOutlined />} onClick={() => onManageImages(plant)}>
                图片
              </Button>,
            ]
          : []),
        <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => onEdit(plant)}>
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="归档植物"
          description={
            hasImages
              ? `该植物还有 ${imageCount} 张图片。归档后可在归档库中恢复或永久删除。`
              : '归档后可在归档库中恢复或永久删除。'
          }
          okText="归档"
          cancelText="取消"
          onConfirm={() => onDelete(plant.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            归档
          </Button>
        </Popconfirm>,
      ]}
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
              <div style={{ marginBottom: '12px', minHeight: '40px' }}>{plant.description}</div>
            )}
            <Space size="middle">
              {plant.roomName && (
                <Space size={4}>
                  <EnvironmentOutlined />
                  <span>{plant.roomName}</span>
                </Space>
              )}
              {plant.purchaseDate && (
                <Space size={4}>
                  <CalendarOutlined />
                  <span>{dayjs(plant.purchaseDate).format('YYYY-MM-DD')}</span>
                </Space>
              )}
            </Space>
          </div>
        }
      />
      {(plant.imageCount || 0) > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
          <Space>
            <span>图片数量: </span>
            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{plant.imageCount}</span>
          </Space>
        </div>
      )}

      <PlantTaskProgress plantId={plant.id} />
    </Card>
  )
}

export default PlantCard
