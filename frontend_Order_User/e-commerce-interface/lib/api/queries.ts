import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/service/userService'
import type { UserDetail } from '@/types/user'

const USER_QUERY_KEY = ['user'] as const

/**
 * Hook để fetch user detail
 * - Auto caching: 5 phút
 * - Auto garbage collection: 10 phút
 */
export const useUserDetail = (userId: number) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, userId],
    queryFn: () => userService.getUserById(userId),
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút (cũ là cacheTime)
    enabled: !!userId, // Chỉ fetch khi có userId
  })
}

/**
 * Hook để update user
 * - Tự động invalidate cache sau khi update thành công
 * - Revalidate query để fetch dữ liệu mới
 */
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      data,
      avatar,
    }: {
      userId: number
      data: Partial<UserDetail>
      avatar?: File
    }) => userService.updateUser(userId, data, avatar),

    onSuccess: (updatedUser, variables) => {
      // ✅ Cập nhật cache ngay lập tức
      queryClient.setQueryData([...USER_QUERY_KEY, variables.userId], updatedUser)

      // ✅ Revalidate all user queries
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEY,
      })
    },

    onError: (error: any) => {
      console.error('❌ [useUpdateUserMutation] Error:', error.message)
    },
  })
}
