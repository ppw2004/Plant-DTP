import { Card, Image, Tag } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import type { Plant } from '../../types/api'

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

  // 优先使用缩略图，如果不存在则使用原图，最后为空字符串
  const imageUrl = plant.primaryImage?.thumbnailUrl || plant.primaryImage?.url || ''

  // 调试：输出图片信息
  console.log('Plant card image:', {
    plantId: plant.id,
    plantName: plant.name,
    hasPrimaryImage: !!plant.primaryImage,
    thumbnailUrl: plant.primaryImage?.thumbnailUrl,
    originalUrl: plant.primaryImage?.url,
    finalImageUrl: imageUrl
  })

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
        {plant.roomName && (
          <div style={{
            fontSize: 12,
            color: '#999',
            marginBottom: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            📍 {plant.roomName}
          </div>
        )}

        {/* 健康状态标签 */}
        {plant.healthStatus && (
          <div style={{ display: 'flex', gap: 4 }}>
            {plant.healthStatus === 'healthy' && (
              <Tag color="success" style={{ fontSize: 10 }}>
                健康
              </Tag>
            )}
            {plant.healthStatus === 'needs_attention' && (
              <Tag color="warning" style={{ fontSize: 10 }}>
                需要关注
              </Tag>
            )}
            {plant.healthStatus === 'critical' && (
              <Tag color="danger" style={{ fontSize: 10 }}>
                紧急
              </Tag>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
