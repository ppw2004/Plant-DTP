import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import {
  getPlantConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  completeTask,
} from '../services/configService'
import type { PlantConfig, PlantConfigFormData } from '../types/api'

export const usePlantConfigs = (plantId: number) => {
  const queryClient = useQueryClient()

  const configsQuery = useQuery<PlantConfig[]>({
    queryKey: ['plantConfigs', plantId],
    queryFn: () => getPlantConfigs(plantId),
    enabled: !!plantId,
  })

  const createMutation = useMutation({
    mutationFn: (data: PlantConfigFormData) => createConfig(plantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantConfigs', plantId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      message.success('养护配置创建成功')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ configId, data }: { configId: number; data: Partial<PlantConfigFormData> }) =>
      updateConfig(configId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantConfigs', plantId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      message.success('配置更新成功')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (configId: number) => deleteConfig(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantConfigs', plantId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      message.success('配置已删除')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '删除失败')
    },
  })

  const completeTaskMutation = useMutation({
    mutationFn: ({ configId, note }: { configId: number; note?: string }) =>
      completeTask(configId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantConfigs', plantId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      message.success('任务已完成')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '操作失败')
    },
  })

  return {
    configs: configsQuery.data || [],
    isLoading: configsQuery.isLoading,
    createConfig: createMutation.mutate,
    updateConfig: updateMutation.mutate,
    deleteConfig: deleteMutation.mutate,
    completeTask: completeTaskMutation.mutate,
  }
}
