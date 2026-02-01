import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button, Card, Divider } from 'antd-mobile'
import { LeftOutline, ClockCircleOutline } from 'antd-mobile-icons'
import IdentifyResultCard from '../../components/mobile/IdentifyResultCard'
import IdentifyFeedback from '../../components/mobile/IdentifyFeedback'
import { useIdentification } from '../../hooks/useIdentifications'
import type { PlantPrediction } from '../../types/api'

/**
 * 移动端识别结果页面
 * 显示识别结果并允许用户提交反馈
 */
export default function MobileIdentifyResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [feedbackVisible, setFeedbackVisible] = useState(false)

  const identificationId = Number(id)
  const { data: identification, isLoading } = useIdentification(identificationId)

  // 从路由state获取结果（如果是刚识别完）
  const resultFromState = location.state?.result
  const predictions = identification?.predictions || resultFromState?.predictions || []
  const topPrediction = predictions[0]

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    )
  }

  if (!topPrediction) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>识别结果不存在</div>
        <Button
          color="primary"
          onClick={() => navigate('/mobile/identify')}
          style={{ marginTop: 16 }}
        >
          重新识别
        </Button>
      </div>
    )
  }

  const processingTime = identification?.processingTime || resultFromState?.processingTime || 0
  const cached = identification?.cached || resultFromState?.cached || false

  const handleFeedbackOpen = () => {
    setFeedbackVisible(true)
  }

  const handlePlantCreated = () => {
    // 跳转到植物列表
    navigate('/mobile/plants')
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* 顶部导航 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          borderBottom: '1px solid #eee',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 100,
        }}
      >
        <LeftOutline
          onClick={() => navigate('/mobile/identify')}
          style={{ fontSize: 24, cursor: 'pointer' }}
        />
        <div style={{ fontSize: 18, fontWeight: 600 }}>识别结果</div>
      </div>

      {/* 原始图片 */}
      {identification?.imageUrl && (
        <div
          style={{
            width: '100%',
            height: 300,
            backgroundColor: '#f5f5f5',
            backgroundImage: `url(${identification.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* 识别信息 */}
      <Card style={{ margin: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: '#666' }}>
            {cached ? (
              <span style={{ color: '#52c41a' }}>
                <ClockCircleOutline style={{ marginRight: 4 }} />
                缓存结果
              </span>
            ) : (
              'AI识别'
            )}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            耗时 {processingTime.toFixed(2)}秒
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          识别结果 {predictions.length > 0 && `(${predictions.length}个候选)`}
        </div>
      </Card>

      {/* 识别结果列表 */}
      <div style={{ padding: '0 16px' }}>
        {predictions.map((prediction: PlantPrediction) => (
          <IdentifyResultCard
            key={prediction.rank}
            prediction={prediction}
            isSelected={prediction.rank === 1}
            onClick={() => {
              // 可以点击查看详情
              setFeedbackVisible(true)
            }}
          />
        ))}
      </div>

      {/* 底部操作按钮 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
          padding: '12px 16px',
          display: 'flex',
          gap: 12,
        }}
      >
        <Button
          block
          color="default"
          fill="outline"
          onClick={() => navigate('/mobile/identify')}
        >
          重新识别
        </Button>
        <Button block color="primary" onClick={handleFeedbackOpen}>
          提交反馈
        </Button>
      </div>

      {/* 反馈弹窗 */}
      <IdentifyFeedback
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        identificationId={identificationId}
        prediction={topPrediction}
        onCreatePlant={handlePlantCreated}
      />
    </div>
  )
}
