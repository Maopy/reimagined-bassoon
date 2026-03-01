import { describe, it, expect } from 'vitest'
import {
  isValidYouTubeUrl,
  cleanYouTubeUrl,
  getErrorMessage,
} from './validators'
import { VideoFetchError, ERROR_CODES } from '@/types/youtube'

describe('validators', () => {
  describe('isValidYouTubeUrl', () => {
    it('should validate standard YouTube URLs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
      expect(isValidYouTubeUrl('https://youtube.com/watch?v=abc123')).toBe(true)
    })

    it('should validate youtu.be short URLs', () => {
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
      expect(isValidYouTubeUrl('https://youtu.be/abc123')).toBe(true)
    })

    it('should validate embed URLs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true)
    })

    it('should invalidate invalid URLs', () => {
      expect(isValidYouTubeUrl('not-a-url')).toBe(false)
      expect(isValidYouTubeUrl('https://google.com')).toBe(false)
      expect(isValidYouTubeUrl('')).toBe(false)
    })

    it('should handle URLs with extra whitespace', () => {
      expect(isValidYouTubeUrl('  https://youtube.com/watch?v=abc123  ')).toBe(true)
    })
  })

  describe('cleanYouTubeUrl', () => {
    it('should remove extra query parameters from standard URLs', () => {
      const dirty = 'https://youtube.com/watch?v=abc123&list=playlist&index=1&t=30s'
      const clean = cleanYouTubeUrl(dirty)
      expect(clean).toBe('https://www.youtube.com/watch?v=abc123')
    })

    it('should convert youtu.be URLs to standard format', () => {
      const short = 'https://youtu.be/dQw4w9WgXcQ'
      const clean = cleanYouTubeUrl(short)
      expect(clean).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    })

    it('should throw VideoFetchError for invalid URLs', () => {
      expect(() => cleanYouTubeUrl('not-a-url')).toThrow(VideoFetchError)
      expect(() => cleanYouTubeUrl('not-a-url')).toThrow('无效的 URL 格式')
    })
  })

  describe('getErrorMessage', () => {
    it('should return message for VideoFetchError', () => {
      const error = new VideoFetchError('自定义错误', ERROR_CODES.NETWORK_ERROR)
      expect(getErrorMessage(error)).toBe('自定义错误')
    })

    it('should return user-friendly message for network errors', () => {
      const error = new Error('Network request failed')
      expect(getErrorMessage(error)).toBe('网络连接失败，请检查网络连接')
    })

    it('should return user-friendly message for bot detection', () => {
      const error = new Error('Sign in to confirm you are not a bot')
      expect(getErrorMessage(error)).toContain('机器人验证')
    })

    it('should return user-friendly message for private videos', () => {
      const error = new Error('Video unavailable - Private video')
      expect(getErrorMessage(error)).toContain('私密视频')
    })

    it('should return original message for unknown errors', () => {
      const error = new Error('Some random error')
      expect(getErrorMessage(error)).toBe('Some random error')
    })

    it('should handle unknown error types', () => {
      expect(getErrorMessage(null)).toBe('未知错误，请稍后重试')
      expect(getErrorMessage(undefined)).toBe('未知错误，请稍后重试')
      expect(getErrorMessage('string error')).toBe('未知错误，请稍后重试')
    })
  })
})
