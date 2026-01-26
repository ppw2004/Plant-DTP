import api from './api'
import type { PlantImage, PlantImageFormData } from '../types/api'

// Get all images for a plant
export const getPlantImages = async (plantId: number): Promise<PlantImage[]> => {
  const response = await api.get<{ data: PlantImage[] }>(`/plants/${plantId}/images`)
  return response.data.data
}

// Get a single image by ID
export const getImage = async (plantId: number, imageId: number): Promise<PlantImage> => {
  const response = await api.get<{ data: PlantImage }>(`/plants/${plantId}/images/${imageId}`)
  return response.data.data
}

// Add image via URL
export const addImage = async (plantId: number, data: PlantImageFormData): Promise<PlantImage> => {
  const response = await api.post<{ data: PlantImage }>(`/plants/${plantId}/images`, data)
  return response.data.data
}

// Upload image file
export const uploadImage = async (plantId: number, formData: FormData): Promise<PlantImage> => {
  // Don't set Content-Type header - axios will set it automatically with correct boundary
  const response = await api.post<{ data: PlantImage }>(`/plants/${plantId}/images/upload`, formData)
  return response.data.data
}

// Update image
export const updateImage = async (
  plantId: number,
  imageId: number,
  data: Partial<PlantImageFormData>
): Promise<PlantImage> => {
  const response = await api.put<{ data: PlantImage }>(`/plants/${plantId}/images/${imageId}`, data)
  return response.data.data
}

// Delete image
export const deleteImage = async (plantId: number, imageId: number): Promise<void> => {
  await api.delete(`/plants/${plantId}/images/${imageId}`)
}

// Set image as primary
export const setPrimaryImage = async (plantId: number, imageId: number): Promise<PlantImage> => {
  const response = await api.patch<{ data: PlantImage }>(`/plants/${plantId}/images/${imageId}/primary`)
  return response.data.data
}
