import { useQuery } from '@tanstack/react-query'
import * as dashboardService from '../services/dashboardService'

// Get dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getDashboardStats(),
  })
}
