import { ERROR_CODES, VideoFetchError } from '@/types/youtube'

/**
 * 验证 YouTube URL 是否有效
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  // 支持多种 YouTube URL 格式
  const patterns = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/, // 标准格式
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/, // 短链接
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/, // 嵌入格式
    /^(https?:\/\/)?(www\.)?youtube\.com\/v\/[\w-]+/, // 旧格式
  ]

  return patterns.some(pattern => pattern.test(url.trim()))
}

/**
 * 清理 YouTube URL，移除不必要的参数
 */
export function cleanYouTubeUrl(url: string): string {
  try {
    const urlObj = new URL(url)

    // 处理 youtu.be 短链接
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1)
      return `https://www.youtube.com/watch?v=${videoId}`
    }

    // 处理标准 YouTube 链接
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v')
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`
      }
    }

    return url
  } catch {
    throw new VideoFetchError('无效的 URL 格式', ERROR_CODES.INVALID_URL)
  }
}

/**
 * 获取用户友好的错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof VideoFetchError) {
    return error.message
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // 根据错误消息内容判断错误类型
    if (message.includes('network') || message.includes('fetch')) {
      return '网络连接失败，请检查网络连接'
    }

    if (message.includes('bot') || message.includes('sign in')) {
      return '检测到机器人验证，请稍后重试或使用浏览器登录 YouTube'
    }

    if (message.includes('private') || message.includes('unavailable')) {
      return '视频不可用或为私密视频'
    }

    // 返回原始错误消息
    return error.message
  }

  return '未知错误，请稍后重试'
}
