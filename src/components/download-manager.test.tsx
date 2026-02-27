/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DownloadManager } from './download-manager'
import * as youtubeService from '@/lib/api/youtube.service'

const mockGetVideoInfo = vi.spyOn(youtubeService, 'getVideoInfo')

describe('DownloadManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with default state', () => {
    render(<DownloadManager />)

    expect(screen.getByText('YouTube 下载器')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /解析/i })).toBeInTheDocument()
    expect(screen.getByText('视频信息将显示在这里')).toBeInTheDocument()
  })

  it('shows error message if API fails', async () => {
    mockGetVideoInfo.mockRejectedValueOnce(new Error('Network error or bot detection fallback'))

    render(<DownloadManager />)

    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=123' } })

    const parseBtn = screen.getByRole('button', { name: /解析/i })
    fireEvent.click(parseBtn)

    // Ensure loading state flips
    expect(screen.getByRole('button', { name: /解析中/i })).toBeDisabled()

    // Error rendering eventually
    await waitFor(() => {
      expect(screen.getByText('Error: Network error or bot detection fallback')).toBeInTheDocument()
    })

    // Check loading state ends
    expect(screen.getByRole('button', { name: '解析' })).not.toBeDisabled()
  })

  it('renders video info correctly upon successful fetch', async () => {
    mockGetVideoInfo.mockResolvedValueOnce({
      id: '123',
      title: 'Epic Video',
      thumbnail: 'https://example.com/thumb.png',
      duration: 300,
      uploader: 'Epic Channel',
      formats: [
        {
          format_id: '137',
          ext: 'mp4',
          resolution: '1080p',
          filesize: null,
          vcodec: 'avc',
          acodec: 'none'
        }
      ]
    })

    render(<DownloadManager />)

    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=123' } })

    const parseBtn = screen.getByRole('button', { name: /解析/i })
    fireEvent.click(parseBtn)

    await waitFor(() => {
      expect(screen.getByText('Epic Video')).toBeInTheDocument()
    })

    expect(screen.getByText(/Epic Channel/i)).toBeInTheDocument()
    expect(screen.getByText(/5 分钟/i)).toBeInTheDocument()
    expect(screen.getByText('找到 1 个串流格式')).toBeInTheDocument()

    const img = screen.getByAltText('thumbnail') as HTMLImageElement
    expect(img.src).toBe('https://example.com/thumb.png')

    // Error banner should not exist
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument()
  })
})
