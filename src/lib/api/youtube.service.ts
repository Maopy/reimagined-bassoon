import { invoke } from '@tauri-apps/api/core'
import {
  type VideoInfo,
  type YtDlpResponse,
  VideoFetchError,
  ERROR_CODES,
} from '@/types/youtube'
import { isValidYouTubeUrl, cleanYouTubeUrl } from '@/lib/validators'

/**
 * 从 YouTube URL 获取视频信息
 * @param url YouTube 视频链接
 * @returns 标准化的视频信息
 * @throws VideoFetchError 当 URL 无效或请求失败时
 */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  // 验证 URL
  if (!isValidYouTubeUrl(url)) {
    throw new VideoFetchError(
      '请输入有效的 YouTube 视频链接',
      ERROR_CODES.INVALID_URL
    )
  }

  // 清理 URL
  const cleanedUrl = cleanYouTubeUrl(url)

  try {
    // 调用 Rust 命令，返回原始 JSON 字符串
    const rawJson = await invoke<string>('cmd_get_video_info', {
      url: cleanedUrl,
    })

    // 解析 JSON
    let data: YtDlpResponse
    try {
      data = JSON.parse(rawJson)
    } catch (parseError) {
      throw new VideoFetchError(
        '解析视频信息失败',
        ERROR_CODES.PARSE_ERROR,
        parseError
      )
    }

    // 标准化数据格式
    return {
      id: data.id || '',
      title: data.title || '未知标题',
      thumbnail: data.thumbnail || '',
      duration: data.duration || 0,
      uploader: data.uploader || '未知上传者',
      formats: (data.formats || []).map(f => ({
        format_id: f.format_id || '',
        ext: f.ext || 'unknown',
        resolution: f.resolution || 'audio only',
        filesize: f.filesize || f.filesize_approx || null,
        vcodec: f.vcodec || 'none',
        acodec: f.acodec || 'none',
      })),
    }
  } catch (error) {
    // 如果已经是 VideoFetchError，直接抛出
    if (error instanceof VideoFetchError) {
      throw error
    }

    // 否则包装为 VideoFetchError
    throw new VideoFetchError(
      '获取视频信息失败，请稍后重试',
      ERROR_CODES.UNKNOWN,
      error
    )
  }
}
