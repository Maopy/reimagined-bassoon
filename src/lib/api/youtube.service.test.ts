import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getVideoInfo } from './youtube.service'
import { invoke } from '@tauri-apps/api/core'

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

    // Setup mock invoke to return serialized JSON string as it does in real Tauri binding
    vi.mocked(invoke).mockResolvedValueOnce(JSON.stringify(mockApiResponse))

    const url = 'https://youtube.com/watch?v=dQw4w9WgXcQ'
    const result = await getVideoInfo(url)

    expect(invoke).toHaveBeenCalledWith('cmd_get_video_info', { url })

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

    const result = await getVideoInfo('https://yt.com')

    expect(result.id).toBe('')
    expect(result.title).toBe('')
    expect(result.formats).toEqual([])
  })
})
