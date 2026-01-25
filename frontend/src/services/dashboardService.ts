import api from './api'
import type { DashboardStats } from '../types/api'

// Get dashboard statistics by aggregating data from multiple endpoints
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get total rooms count
  const roomsResponse = await api.get<any>('/rooms/', {
    params: { pageSize: 1 }
  })

  // Get total plants count
  const plantsResponse = await api.get<any>('/plants/', {
    params: { pageSize: 1 }
  })

  // Get task counts
  const todayTasksResponse = await api.get<any>('/tasks/today')
  const upcomingTasksResponse = await api.get<any>('/tasks/upcoming')
  const overdueTasksResponse = await api.get<any>('/tasks/overdue')

  return {
    totalRooms: roomsResponse.data.data.pagination?.total || 0,
    totalPlants: plantsResponse.data.data.pagination?.total || 0,
    todayTasksCount: todayTasksResponse.data.data.items?.length || 0,
    upcomingTasksCount: upcomingTasksResponse.data.data.items?.length || 0,
    overdueTasksCount: overdueTasksResponse.data.data.items?.length || 0,
  }
}
