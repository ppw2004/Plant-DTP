import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSuggestions, createSuggestion } from '../services/suggestionService'
import type { SuggestionFormData } from '../types/api'

export const useSuggestions = () => {
  return useQuery({
    queryKey: ['suggestions'],
    queryFn: () => getSuggestions(0, 50),
  })
}

export const useCreateSuggestion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SuggestionFormData) => createSuggestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })
}
