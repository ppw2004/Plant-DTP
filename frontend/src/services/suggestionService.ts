import api from './api'
import type { Suggestion, SuggestionFormData } from '../types/api'

export const getSuggestions = async (skip = 0, limit = 50) => {
  const response = await api.get('/suggestions/', { params: { skip, limit } })
  return response.data.data
}

export const createSuggestion = async (data: SuggestionFormData): Promise<Suggestion> => {
  const response = await api.post<{ data: Suggestion }>('/suggestions/', data)
  return response.data.data
}
