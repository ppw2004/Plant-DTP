import { useState, useEffect } from 'react'
import { AutoCenter, InfiniteScroll, SearchBar, DotLoading } from 'antd-mobile'
import { usePlants } from '../../hooks/usePlants'
import MobilePlantCard from '../../components/mobile/MobilePlantCard'

/**
 * 移动端植物列表页
 *
 * 功能：
 * - 植物网格展示（2列）
 * - 搜索功能
 * - 无限滚动加载
 * - 空状态提示
 */
export default function MobilePlants() {
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchText, setSearchText] = useState('')

  const { plants, isLoading } = usePlants({
    page,
    search: searchText,
  })

  // 加载更多
  const loadMore = async () => {
    if (!hasMore || isLoading) return

    const newPage = page + 1
    setPage(newPage)

    // 检查是否还有更多数据（假设总共100条）
    if (plants.length >= 100) {
      setHasMore(false)
    }
  }

  // 搜索时重置
  useEffect(() => {
    setPage(1)
    setHasMore(true)
  }, [searchText])

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
      {plants.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          padding: '0 16px',
        }}>
          {plants.map(plant => (
            <MobilePlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}

      {/* 加载更多 */}
      {plants.length > 0 && (
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          {hasMore ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <DotLoading />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
              没有更多了
            </div>
          )}
        </InfiniteScroll>
      )}

      {/* 空状态 */}
      {plants.length === 0 && !isLoading && (
        <AutoCenter>
          <div style={{ textAlign: 'center', marginTop: 100, color: '#999' }}>
            <div style={{ fontSize: 48 }}>🌱</div>
            <div style={{ marginTop: 16 }}>
              {searchText ? '没有找到相关植物' : '还没有植物，快去添加吧！'}
            </div>
          </div>
        </AutoCenter>
      )}
    </div>
  )
}
