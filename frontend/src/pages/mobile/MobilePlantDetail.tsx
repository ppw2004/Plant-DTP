import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Grid, Toast } from 'antd-mobile'
import { LeftOutline, CameraOutline } from 'antd-mobile-icons'
import { usePlant } from '../../hooks/usePlants'
import { usePlantImages } from '../../hooks/useImages'

/**
 * 移动端植物详情页
 */
export default function MobilePlantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const plantId = Number(id)

  const { data: plant, isLoading } = usePlant(plantId)
  const { data: images } = usePlantImages(plantId)

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        加载中...
      </div>
    )
  }

  if (!plant) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>植物不存在</div>
        <Button color="primary" onClick={() => navigate('/mobile/plants')}>
          返回列表
        </Button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* 顶部导航 */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
      }}>
        <LeftOutline onClick={() => navigate('/mobile/plants')} style={{ fontSize: 24, cursor: 'pointer' }} />
        <div style={{ fontSize: 18, fontWeight: 600 }}>植物详情</div>
      </div>

      {/* 植物图片 */}
      {images && images.length > 0 && (
        <div style={{
          width: '100%',
          height: 300,
          backgroundColor: '#f5f5f5',
          backgroundImage: `url(${images[0].url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
      )}

      {/* 基本信息 */}
      <Card style={{ margin: 16 }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: 24 }}>{plant.name}</h2>
        <div style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
          {plant.scientificName || '未填写学名'}
        </div>

        <Grid columns={2} gap={16}>
          <Grid.Item>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>所在位置</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>
                {plant.roomName || '未放置'}
              </div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>健康状态</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>
                {plant.healthStatus === 'healthy' ? '健康' :
                 plant.healthStatus === 'needs_attention' ? '需要关注' : '严重'}
              </div>
            </div>
          </Grid.Item>
        </Grid>
      </Card>

      {/* 详细信息 */}
      {plant.description && (
        <Card style={{ margin: '0 16px 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>描述</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
            {plant.description}
          </div>
        </Card>
      )}

      {/* 底部操作按钮 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #eee',
        padding: '12px 16px',
        display: 'flex',
        gap: 12,
      }}>
        <Button
          block
          color="primary"
          onClick={() => {
            Toast.show({ content: '功能开发中' })
          }}
        >
          <CameraOutline style={{ marginRight: 8 }} />
          添加照片
        </Button>
      </div>
    </div>
  )
}
