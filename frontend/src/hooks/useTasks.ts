import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import * as taskService from '../services/taskService'

// Get task list (today, upcoming, overdue)
export const useTaskList = () => {
  return useQuery({
    queryKey: ['taskList'],
    queryFn: () => taskService.getTaskList(),
  })
}

// Get today's tasks
export const useTodayTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => taskService.getTodayTasks(),
  })
}

// Get upcoming tasks
export const useUpcomingTasks = (days: number = 7) => {
  return useQuery({
    queryKey: ['tasks', 'upcoming', days],
    queryFn: () => taskService.getUpcomingTasks(days),
  })
}

// Get overdue tasks
export const useOverdueTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: () => taskService.getOverdueTasks(),
  })
}

// Get plant tasks
export const usePlantTasks = (plantId: number) => {
  return useQuery({
    queryKey: ['plantTasks', plantId],
    queryFn: () => taskService.getPlantTasks(plantId),
    enabled: !!plantId,
  })
}

// Complete task
export const useCompleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, notes }: { taskId: number; notes?: string }) =>
      taskService.completeTask(taskId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['taskList'] })
      queryClient.invalidateQueries({ queryKey: ['plantTasks'] })
      message.success('任务已完成')
    },
  })
}
