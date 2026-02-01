import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import {
  identifyPlant,
  getIdentifications,
  getIdentification,
  submitIdentificationFeedback,
  createPlantFromIdentification,
  deleteIdentification,
} from '../services/identificationService'
import type {
  IdentificationFilters,
  IdentificationFeedbackData,
  CreatePlantFromIdentificationData,
} from '../types/api'

/**
 * 获取识别历史列表
 */
export const useIdentifications = (filters?: IdentificationFilters) => {
  return useQuery({
    queryKey: ['identifications', filters],
    queryFn: () => getIdentifications(filters),
  })
}

/**
 * 获取单个识别记录详情
 */
export const useIdentification = (id: number) => {
  return useQuery({
    queryKey: ['identification', id],
    queryFn: () => getIdentification(id),
    enabled: !!id,
  })
}

/**
 * 识别植物
 */
export const useIdentifyPlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, includeDetails }: { file: File; includeDetails?: boolean }) =>
      identifyPlant(file, includeDetails),
    onSuccess: (data) => {
      // 刷新识别历史列表
      queryClient.invalidateQueries({ queryKey: ['identifications'] })

      if (data.cached) {
        message.info('使用缓存结果，识别更快')
      } else {
        message.success('识别成功')
      }
    },
    onError: (error: any) => {
      console.error('识别失败:', error)
      message.error('识别失败，请重试')
    },
  })
}

/**
 * 提交识别反馈
 */
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback: IdentificationFeedbackData }) =>
      submitIdentificationFeedback(id, feedback),
    onSuccess: (_, variables) => {
      // 刷新识别记录详情
      queryClient.invalidateQueries({ queryKey: ['identification', variables.id] })
      // 刷新识别历史列表
      queryClient.invalidateQueries({ queryKey: ['identifications'] })
      message.success('反馈提交成功')
    },
    onError: (error: any) => {
      console.error('反馈提交失败:', error)
      message.error('反馈提交失败，请重试')
    },
  })
}

/**
 * 基于识别结果创建植物
 */
export const useCreatePlantFromIdentification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: CreatePlantFromIdentificationData
    }) => createPlantFromIdentification(id, data),
    onSuccess: (data, variables) => {
      // 刷新识别记录详情
      queryClient.invalidateQueries({ queryKey: ['identification', variables.id] })
      // 刷新识别历史列表
      queryClient.invalidateQueries({ queryKey: ['identifications'] })
      // 刷新植物列表
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      message.success(`已创建植物: ${data.name}`)
    },
    onError: (error: any) => {
      console.error('创建植物失败:', error)
      message.error('创建植物失败，请重试')
    },
  })
}

/**
 * 删除识别记录
 */
export const useDeleteIdentification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteIdentification(id),
    onSuccess: () => {
      // 刷新识别历史列表
      queryClient.invalidateQueries({ queryKey: ['identifications'] })
      message.success('删除成功')
    },
    onError: (error: any) => {
      console.error('删除失败:', error)
      message.error('删除失败，请重试')
    },
  })
}
