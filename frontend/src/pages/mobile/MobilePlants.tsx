import { useState, useEffect } from 'react'
import { SearchBar, DotLoading, Button } from 'antd-mobile'
import { usePlants } from '../../hooks/usePlants'
import MobilePlantCard from '../../components/mobile/MobilePlantCard'

/**
 * 移动端植物列表页
 *
 * 功能：
 * - 植物网格展示（2列）
 * - 搜索功能
 * - 加载更多按钮
 * - 空状态提示
 */
export default function MobilePlants() {
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [allPlants, setAllPlants] = useState<any[]>([])

  const { data, isLoading } = usePlants({
    page,
    search: searchText,
  })
  const plants = data?.items || []
  const total = data?.total || 0

  // 更新所有植物列表
  useEffect(() => {
    if (page === 1) {
      setAllPlants(plants)
    } else {
      setAllPlants(prev => [...prev, ...plants])
    }
  }, [plants, page])

  // 搜索时重置
  useEffect(() => {
    setPage(1)
    setAllPlants([])
  }, [searchText])

  // 加载更多
  const loadMore = () => {
    setPage(p => p + 1)
  }

  const hasMore = allPlants.length < total

  return (
    <div style={{ paddingBottom: 66 }}>
      {/* 搜索栏 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#fff', marginBottom: 8 }}>
        <SearchBar
          placeholder="搜索植物名称..."
          value={searchText}
          onChange={setSearchText}
        />
      </div>

      {/* 植物网格 - 2列布局 */}
      {allPlants.length > 0 && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            padding: '0 16px',
          }}>
            {allPlants.map(plant => (
              <MobilePlantCard key={plant.id} plant={plant} />
            ))}
          </div>

          {/* 加载更多按钮 */}
          {hasMore && (
            <div style={{ padding: '16px' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center' }}>
                  <DotLoading />
                </div>
              ) : (
                <Button
                  block
                  color="primary"
                  fill="outline"
                  onClick={loadMore}
                >
                  加载更多 ({allPlants.length}/{total})
                </Button>
              )}
            </div>
          )}

          {/* 已全部加载 */}
          {!hasMore && allPlants.length > 0 && (
            <div style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
              已加载全部 {allPlants.length} 个植物
            </div>
          )}
        </>
      )}

      {/* 加载状态（首次加载） */}
      {allPlants.length === 0 && isLoading && (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <DotLoading />
        </div>
      )}

      {/* 空状态 */}
      {allPlants.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', marginTop: 100, color: '#999' }}>
          <div style={{ fontSize: 48 }}>🌱</div>
          <div style={{ marginTop: 16 }}>
            {searchText ? '没有找到相关植物' : '还没有植物，快去添加吧！'}
          </div>
        </div>
      )}
    </div>
  )
}
