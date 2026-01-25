import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import * as plantService from '../services/plantService'
import type { PlantFormData, PlantFilters } from '../types/api'

// Get all plants with filters
export const usePlants = (filters?: PlantFilters) => {
  return useQuery({
    queryKey: ['plants', filters],
    queryFn: () => plantService.getPlants(filters),
  })
}

// Get single plant
export const usePlant = (id: number) => {
  return useQuery({
    queryKey: ['plant', id],
    queryFn: () => plantService.getPlant(id),
    enabled: !!id,
  })
}

// Create plant
export const useCreatePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlantFormData) => plantService.createPlant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      queryClient.invalidateQueries({ queryKey: ['roomStats'] })
      message.success('植物创建成功')
    },
  })
}

// Update plant
export const useUpdatePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PlantFormData> }) =>
      plantService.updatePlant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      queryClient.invalidateQueries({ queryKey: ['plant', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['roomStats'] })
      message.success('植物更新成功')
    },
  })
}

// Archive plant (soft delete)
export const useDeletePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => plantService.archivePlant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      queryClient.invalidateQueries({ queryKey: ['roomStats'] })
      message.success('植物已归档')
    },
  })
}
