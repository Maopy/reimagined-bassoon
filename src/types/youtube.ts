// yt-dlp API 响应类型（原始格式）
export interface YtDlpFormat {
  format_id?: string
  ext?: string
  resolution?: string
  filesize?: number
  filesize_approx?: number
  vcodec?: string
  acodec?: string
}

export interface YtDlpResponse {
  id?: string
  title?: string
  thumbnail?: string
  duration?: number
  uploader?: string
  formats?: YtDlpFormat[]
}

// 应用内部使用的标准化类型
export interface VideoFormat {
  format_id: string
  ext: string
  resolution: string
  filesize: number | null
  vcodec: string
  acodec: string
}

export interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: number
  uploader: string
  formats: VideoFormat[]
}

// 错误类型
export class VideoFetchError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'VideoFetchError'
  }
}

export const ERROR_CODES = {
  INVALID_URL: 'INVALID_URL',
  NETWORK_ERROR: 'NETWORK_ERROR',
  BOT_DETECTED: 'BOT_DETECTED',
  PARSE_ERROR: 'PARSE_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const
