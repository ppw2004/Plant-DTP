import { useState } from 'react'
import { SearchBar, DotLoading } from 'antd-mobile'
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
  const [searchText, setSearchText] = useState('')

  const { data, isLoading } = usePlants({
    page: 1,
    search: searchText,
  })
  const plants = data?.items || []

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
          padding: '0 16px 16px',
        }}>
          {plants.map(plant => (
            <MobilePlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <DotLoading />
        </div>
      )}

      {/* 空状态 */}
      {plants.length === 0 && !isLoading && (
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
