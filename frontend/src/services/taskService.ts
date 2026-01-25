import api from './api'
import type { PlantTask, TaskListResponse } from '../types/api'

// Get task list (aggregates today, upcoming, overdue)
export const getTaskList = async (): Promise<TaskListResponse> => {
  // Fetch all three endpoints in parallel
  const [todayResponse, upcomingResponse, overdueResponse] = await Promise.all([
    api.get('/tasks/today'),
    api.get('/tasks/upcoming'),
    api.get('/tasks/overdue'),
  ])

  // Extract items from each response
  return {
    todayTasks: todayResponse.data.data?.items || [],
    upcomingTasks: upcomingResponse.data.data?.items || [],
    overdueTasks: overdueResponse.data.data?.items || [],
  }
}

// Get today's tasks
export const getTodayTasks = async (): Promise<PlantTask[]> => {
  const response = await api.get('/tasks/today')
  return response.data.data?.items || []
}

// Get upcoming tasks
export const getUpcomingTasks = async (days: number = 7): Promise<PlantTask[]> => {
  const response = await api.get('/tasks/upcoming', { params: { days } })
  return response.data.data?.items || []
}

// Get overdue tasks
export const getOverdueTasks = async (): Promise<PlantTask[]> => {
  const response = await api.get('/tasks/overdue')
  return response.data.data?.items || []
}

// Complete a task
export const completeTask = async (taskId: number, notes?: string): Promise<any> => {
  const response = await api.post(`/tasks/${taskId}/complete`, null, {
    params: notes ? { note: notes } : undefined,
  })
  return response.data.data
}

// Get tasks by plant
export const getPlantTasks = async (plantId: number): Promise<PlantTask[]> => {
  const response = await api.get(`/plants/${plantId}/tasks`)
  return response.data.data?.items || []
}
