import { Card, Image, Tag } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'

interface Plant {
  id: number
  name: string
  location?: string
  primary_image?: {
    thumbnail_url: string
  }
  needs_watering?: boolean
  needs_fertilizing?: boolean
  images?: Array<{ thumbnail_url: string }>
}

interface MobilePlantCardProps {
  plant: Plant
}

/**
 * 移动端植物卡片组件
 *
 * 特点：
 * - 方形布局，适合2列网格
 * - 大图展示
 * - 状态标签
 * - 触摸点击反馈
 */
export default function MobilePlantCard({ plant }: MobilePlantCardProps) {
  const navigate = useNavigate()

  const imageUrl = plant.primary_image?.thumbnail_url || plant.images?.[0]?.thumbnail_url || ''

  return (
    <Card
      onClick={() => navigate(`/mobile/plants/${plant.id}`)}
      style={{
        padding: 0,
        overflow: 'hidden',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* 图片 - 1:1 正方形 */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        position: 'relative'
      }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={plant.name}
            fit="cover"
            width="100%"
            height="100%"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
          }}>
            🌱
          </div>
        )}
      </div>

      {/* 信息区域 */}
      <div style={{ padding: 12 }}>
        {/* 名称 */}
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          marginBottom: 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {plant.name}
        </div>

        {/* 位置 */}
        {plant.location && (
          <div style={{
            fontSize: 12,
            color: '#999',
            marginBottom: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            📍 {plant.location}
          </div>
        )}

        {/* 标签 */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {plant.needs_watering && (
            <Tag color="primary" style={{ fontSize: 10 }}>
              需浇水
            </Tag>
          )}
          {plant.needs_fertilizing && (
            <Tag color="success" style={{ fontSize: 10 }}>
              需施肥
            </Tag>
          )}
        </div>
      </div>
    </Card>
  )
}
