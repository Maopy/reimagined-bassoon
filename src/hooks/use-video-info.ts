import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getVideoInfo } from '@/lib/api/youtube.service'
import { type VideoInfo, ERROR_CODES, VideoFetchError } from '@/types/youtube'

/**
 * 使用 React Query 获取 YouTube 视频信息
 */
export function useVideoInfo(
  url: string,
  options?: Omit<
    UseQueryOptions<VideoInfo, VideoFetchError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<VideoInfo, VideoFetchError>({
    queryKey: ['videoInfo', url],
    queryFn: () => getVideoInfo(url),
    enabled: false, // 默认不自动执行，需要手动触发
    retry: (failureCount, error) => {
      // 对于无效 URL 不重试
      if (error.code === ERROR_CODES.INVALID_URL) {
        return false
      }
      // 其他错误最多重试 2 次
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000), // 指数退避
    ...options,
  })
}
