import { Card } from 'antd-mobile'
import type { PlantPrediction } from '../../types/api'

interface IdentifyResultCardProps {
  prediction: PlantPrediction
  onClick?: () => void
  isSelected?: boolean
}

/**
 * 植物识别结果卡片组件
 */
export default function IdentifyResultCard({
  prediction,
  onClick,
  isSelected = false,
}: IdentifyResultCardProps) {
  const confidencePercent = Math.round(prediction.confidence * 100)

  // 置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#52c41a' // 绿色
    if (confidence >= 0.6) return '#faad14' // 橙色
    return '#ff4d4f' // 红色
  }

  return (
    <Card
      onClick={onClick}
      style={{
        marginBottom: 12,
        border: isSelected ? '2px solid #1677ff' : '1px solid #eee',
        backgroundColor: isSelected ? '#f0f5ff' : '#fff',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* 排名和名称 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: getConfidenceColor(prediction.confidence),
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          {prediction.rank}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            {prediction.name}
          </div>

          {prediction.scientificName && (
            <div style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>
              {prediction.scientificName}
            </div>
          )}
        </div>

        {/* 置信度 */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: getConfidenceColor(prediction.confidence),
            }}
          >
            {confidencePercent}%
          </div>
        </div>
      </div>

      {/* 描述 */}
      {prediction.description && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #f0f0f0',
            fontSize: 13,
            color: '#666',
            lineHeight: 1.6,
          }}
        >
          {prediction.description.length > 150
            ? `${prediction.description.substring(0, 150)}...`
            : prediction.description}
        </div>
      )}

      {/* 百科链接 */}
      {prediction.baikeUrl && (
        <div style={{ marginTop: 8 }}>
          <a
            href={prediction.baikeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: '#1677ff' }}
          >
            查看百科 →
          </a>
        </div>
      )}
    </Card>
  )
}
