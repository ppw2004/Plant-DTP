import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import * as imageService from '../services/imageService'
import type { PlantImageFormData } from '../types/api'

// Get plant images
export const usePlantImages = (plantId: number) => {
  return useQuery({
    queryKey: ['plantImages', plantId],
    queryFn: () => imageService.getPlantImages(plantId),
    enabled: !!plantId,
  })
}

// Get single image
export const useImage = (plantId: number, imageId: number) => {
  return useQuery({
    queryKey: ['plantImage', plantId, imageId],
    queryFn: () => imageService.getImage(plantId, imageId),
    enabled: !!(plantId && imageId),
  })
}

// Add image via URL
export const useAddImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ plantId, data }: { plantId: number; data: PlantImageFormData }) =>
      imageService.addImage(plantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plantImages', variables.plantId] })
      queryClient.invalidateQueries({ queryKey: ['plant', variables.plantId] })
      message.success('图片添加成功')
    },
  })
}

// Upload image file
export const useUploadImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ plantId, formData }: { plantId: number; formData: FormData }) =>
      imageService.uploadImage(plantId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plantImages', variables.plantId] })
      queryClient.invalidateQueries({ queryKey: ['plant', variables.plantId] })
      message.success('图片上传成功')
    },
  })
}

// Update image
export const useUpdateImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      plantId,
      imageId,
      data,
    }: {
      plantId: number
      imageId: number
      data: Partial<PlantImageFormData>
    }) => imageService.updateImage(plantId, imageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plantImages', variables.plantId] })
      queryClient.invalidateQueries({ queryKey: ['plant', variables.plantId] })
      message.success('图片更新成功')
    },
  })
}

// Delete image
export const useDeleteImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ plantId, imageId }: { plantId: number; imageId: number }) =>
      imageService.deleteImage(plantId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plantImages', variables.plantId] })
      queryClient.invalidateQueries({ queryKey: ['plant', variables.plantId] })
      message.success('图片删除成功')
    },
  })
}

// Set primary image
export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ plantId, imageId }: { plantId: number; imageId: number }) =>
      imageService.setPrimaryImage(plantId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plantImages', variables.plantId] })
      queryClient.invalidateQueries({ queryKey: ['plant', variables.plantId] })
      message.success('主图设置成功')
    },
  })
}
