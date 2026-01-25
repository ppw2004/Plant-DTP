import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import api from '../services/api'
import { getShelves, createShelf, updateShelf, deleteShelf, reorderShelves } from '../services/shelfService'
import type { PlantShelf, PlantShelfFormData } from '../types/api'

export const useShelves = (roomId: number) => {
  const queryClient = useQueryClient()

  const shelvesQuery = useQuery<PlantShelf[]>({
    queryKey: ['shelves', roomId],
    queryFn: () => getShelves(roomId).then((data) => data.items),
    enabled: !!roomId,
  })

  const createMutation = useMutation({
    mutationFn: ({ roomId, data }: { roomId: number; data: PlantShelfFormData }) =>
      createShelf(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] })
      message.success('花架创建成功')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ shelfId, data }: { shelfId: number; data: Partial<PlantShelfFormData> }) =>
      updateShelf(shelfId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] })
      message.success('花架更新成功')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (shelfId: number) => deleteShelf(shelfId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] })
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      message.success('花架已删除')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '删除失败')
    },
  })

  const reorderMutation = useMutation({
    mutationFn: ({ roomId, shelfIds }: { roomId: number; shelfIds: number[] }) =>
      reorderShelves(roomId, shelfIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] })
      message.success('花架排序已更新')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '排序失败')
    },
  })

  return {
    shelves: shelvesQuery.data || [],
    isLoading: shelvesQuery.isLoading,
    createShelf: createMutation.mutate,
    updateShelf: updateMutation.mutate,
    deleteShelf: deleteMutation.mutate,
    reorderShelves: reorderMutation.mutate,
  }
}

export const useShelf = (shelfId: number) => {
  return useQuery({
    queryKey: ['shelf', shelfId],
    queryFn: async () => {
      const response = await api.get<{ data: PlantShelf }>(`/shelves/${shelfId}`)
      return response.data.data
    },
    enabled: !!shelfId,
  })
}
