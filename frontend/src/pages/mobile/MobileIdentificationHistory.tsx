import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, InfiniteScroll, PullToRefresh, EmptyBlock } from 'antd-mobile'
import { DeleteOutline } from 'antd-mobile-icons'
import { useIdentifications, useDeleteIdentification } from '../../hooks/useIdentifications'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 移动端识别历史页面
 * 显示所有历史识别记录，支持下拉刷新和删除
 */
export default function MobileIdentificationHistory() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, refetch } = useIdentifications({ page, limit })
  const deleteMutation = useDeleteIdentification()

  const items = data?.items || []
  const total = data?.total || 0
  const hasMore = page * limit < total

  // 加载更多
  const loadMore = async () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1)
    }
  }

  // 下拉刷新
  const handleRefresh = async () => {
    setPage(1)
    await refetch()
  }

  // 删除记录
  const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()

    if (!confirm('确定要删除这条识别记录吗？')) {
      return
    }

    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  // 点击卡片查看详情
  const handleCardClick = (id: number) => {
    navigate(`/mobile/identify/result/${id}`)
  }

  // 获取反馈状态文本
  const getFeedbackText = (feedback?: string) => {
    switch (feedback) {
      case 'correct':
        return '✅ 正确'
      case 'incorrect':
        return '❌ 错误'
      case 'skipped':
        return '⏭️ 跳过'
      default:
        return '⏳ 待反馈'
    }
  }

  // 获取反馈状态颜色
  const getFeedbackColor = (feedback?: string) => {
    switch (feedback) {
      case 'correct':
        return '#52c41a'
      case 'incorrect':
        return '#ff4d4f'
      case 'skipped':
        return '#999'
      default:
        return '#faad14'
    }
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div style={{ padding: 16 }}>
        {/* 顶部导航 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 0',
            position: 'relative',
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => navigate('/mobile')}
            style={{
              position: 'absolute',
              left: 0,
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#333',
            }}
          >
            ←
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>识别历史</h1>
        </div>

        <EmptyBlock
          description="暂无识别记录"
          style={{
            padding: '60px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Button
            color="primary"
            onClick={() => navigate('/mobile/identify')}
            style={{ marginTop: 16 }}
          >
            开始识别
          </Button>
        </EmptyBlock>
      </div>
    )
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
          justifyContent: 'center',
          gap: 12,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => navigate('/mobile')}
          style={{
            position: 'absolute',
            left: 16,
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#333',
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 18, fontWeight: 600 }}>识别历史</div>
        <div style={{ position: 'absolute', right: 16, fontSize: 14, color: '#666' }}>
          共 {total} 条
        </div>
      </div>

      {/* 列表内容 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div style={{ padding: '16px 0' }}>
          {items.map((item) => {
            const topPrediction = item.predictions[0]
            if (!topPrediction) return null

            return (
              <Card
                key={item.id}
                onClick={() => handleCardClick(item.id)}
                style={{
                  margin: '0 16px 12px',
                  cursor: 'pointer',
                  border: '1px solid #f0f0f0',
                }}
              >
                {/* 顶部信息行 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {dayjs(item.createdAt).fromNow()}
                  </div>
                  <Button
                    size="mini"
                    fill="none"
                    color="danger"
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    <DeleteOutline style={{ fontSize: 16 }} />
                  </Button>
                </div>

                {/* 图片和主要信息 */}
                <div style={{ display: 'flex', gap: 12 }}>
                  {/* 缩略图 */}
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: '#f5f5f5',
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                    }}
                  />

                  {/* 识别结果信息 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {topPrediction.name}
                    </div>

                    <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                      置信度: {Math.round(topPrediction.confidence * 100)}%
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: getFeedbackColor(item.feedback),
                        fontWeight: 500,
                      }}
                    >
                      {getFeedbackText(item.feedback)}
                    </div>

                    {/* 如果有关联的植物 */}
                    {item.selectedPlant && (
                      <div
                        style={{
                          fontSize: 12,
                          color: '#52c41a',
                          marginTop: 4,
                        }}
                      >
                        已添加到植物库 → {item.selectedPlant.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* 缓存标记 */}
                {item.cached && (
                  <div
                    style={{
                      fontSize: 11,
                      color: '#52c41a',
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    ⚡ 缓存结果
                  </div>
                )}
              </Card>
            )
          })}

          {/* 加载更多 */}
          <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
        </div>
      </PullToRefresh>
    </div>
  )
}
