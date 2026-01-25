import api from './api'
import type { TaskType } from '../types/api'

// Get all task types
export const getTaskTypes = async (): Promise<TaskType[]> => {
  const response = await api.get<{ data: { items: TaskType[] } }>('/task-types')
  return response.data.data.items
}
