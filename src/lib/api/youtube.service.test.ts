import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getVideoInfo } from './youtube.service'
import { invoke } from '@tauri-apps/api/core'
import { VideoFetchError, ERROR_CODES } from '@/types/youtube'

describe('youtube service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse yt-dlp dump json correctly into VideoInfo interface', async () => {
    const mockApiResponse = {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      thumbnail: 'https://example.com/thumb.jpg',
      duration: 212,
      uploader: 'Rick Astley',
      formats: [
        {
          format_id: '137',
          ext: 'mp4',
          resolution: '1920x1080',
          filesize: 15423000,
          vcodec: 'avc1.640028',
          acodec: 'none'
        },
        {
          format_id: '140',
          ext: 'm4a',
          resolution: 'audio only',
          filesize_approx: 3200000,
          vcodec: 'none',
          acodec: 'mp4a.40.2'
        }
      ]
    }

    // Setup mock invoke to return serialized JSON string
    vi.mocked(invoke).mockResolvedValueOnce(JSON.stringify(mockApiResponse))

    const url = 'https://youtube.com/watch?v=dQw4w9WgXcQ'
    const result = await getVideoInfo(url)

    expect(invoke).toHaveBeenCalledWith('cmd_get_video_info', { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })

    // Check mapping logic
    expect(result.id).toBe('dQw4w9WgXcQ')
    expect(result.title).toBe('Rick Astley - Never Gonna Give You Up')
    expect(result.duration).toBe(212)
    expect(result.formats).toHaveLength(2)

    // Check format mapping (filesize fallback logic)
    expect(result.formats[0].filesize).toBe(15423000)
    expect(result.formats[1].filesize).toBe(3200000) // from filesize_approx
  })

  it('should handle missing fields gracefully', async () => {
    const mockApiResponse = {} // empty response

    vi.mocked(invoke).mockResolvedValueOnce(JSON.stringify(mockApiResponse))

    const result = await getVideoInfo('https://youtube.com/watch?v=123')

    expect(result.id).toBe('')
    expect(result.title).toBe('未知标题')
    expect(result.formats).toEqual([])
  })

  it('should throw VideoFetchError for invalid URL', async () => {
    const invalidUrl = 'not-a-url'

    await expect(getVideoInfo(invalidUrl)).rejects.toThrow(VideoFetchError)
    await expect(getVideoInfo(invalidUrl)).rejects.toThrow('请输入有效的 YouTube 视频链接')

    try {
      await getVideoInfo(invalidUrl)
    } catch (error) {
      expect(error).toBeInstanceOf(VideoFetchError)
      expect((error as VideoFetchError).code).toBe(ERROR_CODES.INVALID_URL)
    }
  })

  it('should throw VideoFetchError for network errors', async () => {
    const validUrl = 'https://youtube.com/watch?v=test'
    vi.mocked(invoke).mockRejectedValueOnce(new Error('Network failed'))

    await expect(getVideoInfo(validUrl)).rejects.toThrow(VideoFetchError)

    try {
      await getVideoInfo(validUrl)
    } catch (error) {
      expect(error).toBeInstanceOf(VideoFetchError)
      // Error code depends on implementation - could be PARSE_ERROR or UNKNOWN
      const errorCode = (error as VideoFetchError).code
      expect([ERROR_CODES.UNKNOWN, ERROR_CODES.PARSE_ERROR]).toContain(errorCode)
    }
  })

  it('should clean YouTube URL before calling API', async () => {
    const mockApiResponse = { id: 'abc123', title: 'Test' }
    vi.mocked(invoke).mockResolvedValueOnce(JSON.stringify(mockApiResponse))

    // URL with extra parameters
    const dirtyUrl = 'https://youtube.com/watch?v=abc123&list=playlist&index=1'
    const expectedCleanUrl = 'https://www.youtube.com/watch?v=abc123'

    await getVideoInfo(dirtyUrl)

    // Should call with cleaned URL
    expect(invoke).toHaveBeenCalledWith('cmd_get_video_info', { url: expectedCleanUrl })
  })
})
