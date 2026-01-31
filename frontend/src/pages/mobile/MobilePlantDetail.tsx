import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Grid, Modal } from 'antd-mobile'
import { LeftOutline, CameraOutline, CheckCircleOutline } from 'antd-mobile-icons'
import { usePlant } from '../../hooks/usePlants'
import { usePlantImages } from '../../hooks/useImages'
import { usePlantConfigs } from '../../hooks/usePlantConfigs'
import MobileImageUpload from '../../components/mobile/MobileImageUpload'
import dayjs from 'dayjs'

/**
 * 移动端植物详情页
 * VERSION: 20260131-TEST-BUILD
 */
export default function MobilePlantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const plantId = Number(id)
  const [imageUploadVisible, setImageUploadVisible] = useState(false)
  const [careModalVisible, setCareModalVisible] = useState(false)

  const { data: plant, isLoading } = usePlant(plantId)
  const { data: images } = usePlantImages(plantId)
  const { configs, completeTask } = usePlantConfigs(plantId)

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

      {/* 养护任务 */}
      <Card style={{ margin: '0 16px 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          养护任务 ({configs?.length || 0})
        </div>
        {configs && configs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {configs.map((config) => (
              <div
                key={config.id}
                style={{
                  padding: 12,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  border: config.isActive ? '1px solid #52c41a' : '1px solid #d9d9d9',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>{config.taskTypeName}</span>
                  <span style={{
                    fontSize: 12,
                    color: config.isActive ? '#52c41a' : '#999'
                  }}>
                    {config.isActive ? '启用' : '禁用'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  每 {config.intervalDays} 天
                </div>
                {config.nextDueAt && (
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                    下次: {dayjs(config.nextDueAt).format('MM-DD')}
                  </div>
                )}
                {config.isActive && (
                  <Button
                    size="small"
                    color="primary"
                    fill="outline"
                    onClick={() => completeTask({ configId: config.id })}
                  >
                    <CheckCircleOutline style={{ marginRight: 4 }} />
                    完成任务
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#999' }}>
            暂无养护任务
          </div>
        )}
      </Card>

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
          onClick={() => setImageUploadVisible(true)}
        >
          <CameraOutline style={{ marginRight: 8 }} />
          照片
        </Button>
        <Button
          block
          color="success"
          onClick={() => setCareModalVisible(true)}
        >
          <CheckCircleOutline style={{ marginRight: 8 }} />
          养护
        </Button>
      </div>

      {/* 养护任务弹窗 */}
      <Modal
        visible={careModalVisible}
        content={
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              {plant?.name} - 养护任务
            </div>
            <div style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              请在桌面端管理养护任务配置
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#666', lineHeight: 1.6 }}>
              当前有 {configs?.length || 0} 个养护任务
            </div>
          </div>
        }
        closeOnMaskClick
        onClose={() => setCareModalVisible(false)}
      />

      {/* 图片上传弹窗 */}
      <MobileImageUpload
        visible={imageUploadVisible}
        onClose={() => setImageUploadVisible(false)}
        plantId={plantId}
      />
    </div>
  )
}
