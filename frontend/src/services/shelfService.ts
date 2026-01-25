import api from './api'
import type { PlantShelf, PlantShelfFormData } from '../types/api'

// 获取房间的所有花架
export const getShelves = async (roomId: number): Promise<{ items: PlantShelf[] }> => {
  const response = await api.get<{ data: { items: PlantShelf[] } }>(`/rooms/${roomId}/shelves`)
  return response.data.data
}

// 获取单个花架详情（包含植物）
export const getShelf = async (shelfId: number): Promise<PlantShelf> => {
  const response = await api.get<{ data: PlantShelf }>(`/shelves/${shelfId}`)
  return response.data.data
}

// 创建花架
export const createShelf = async (roomId: number, data: PlantShelfFormData): Promise<PlantShelf> => {
  const response = await api.post<{ data: PlantShelf }>(`/rooms/${roomId}/shelves`, data)
  return response.data.data
}

// 更新花架
export const updateShelf = async (
  shelfId: number,
  data: Partial<PlantShelfFormData>
): Promise<PlantShelf> => {
  const response = await api.patch<{ data: PlantShelf }>(`/shelves/${shelfId}`, data)
  return response.data.data
}

// 删除花架
export const deleteShelf = async (shelfId: number): Promise<void> => {
  await api.delete(`/shelves/${shelfId}`)
}

// 重新排序花架
export const reorderShelves = async (roomId: number, shelfIds: number[]): Promise<void> => {
  await api.post(`/rooms/${roomId}/shelves/reorder`, shelfIds)
}

// 移动植物到花架
export const movePlantToShelf = async (
  plantId: number,
  shelfId: number | null,
  newOrder?: number
): Promise<{ plant: any; oldShelfId: number | null; newShelfId: number | null }> => {
  const params: any = { shelf_id: shelfId }
  if (newOrder !== undefined) {
    params.new_order = newOrder
  }
  const response = await api.post(`/plants/${plantId}/move`, null, { params })
  return response.data.data
}

// 重新排序花架上的植物
export const reorderPlantsOnShelf = async (
  shelfId: number,
  plantOrders: { plantId: number; order: number }[]
): Promise<void> => {
  console.log('shelfService: Calling reorder API', {
    url: `/shelves/${shelfId}/plants/reorder`,
    data: plantOrders,
    dataType: typeof plantOrders
  })
  const response = await api.post(`/shelves/${shelfId}/plants/reorder`, plantOrders)
  console.log('shelfService: API response', response.data)
  return response.data
}
