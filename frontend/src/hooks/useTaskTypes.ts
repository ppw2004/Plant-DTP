import { useQuery } from '@tanstack/react-query'
import { getTaskTypes } from '../services/taskTypeService'
import type { TaskType } from '../types/api'

export const useTaskTypes = () => {
  return useQuery<TaskType[]>({
    queryKey: ['taskTypes'],
    queryFn: getTaskTypes,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
