/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DownloadManager } from './download-manager'
import * as youtubeService from '@/lib/api/youtube.service'

const mockGetVideoInfo = vi.spyOn(youtubeService, 'getVideoInfo')

// 测试包装器
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('DownloadManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with default state', () => {
    renderWithQueryClient(<DownloadManager />)

    expect(screen.getByText('YouTube 下载器')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /解析/i })).toBeInTheDocument()
    expect(screen.getByText('视频信息将显示在这里')).toBeInTheDocument()
  })

  it('shows validation error for empty URL', async () => {
    renderWithQueryClient(<DownloadManager />)

    const parseBtn = screen.getByRole('button', { name: /解析/i })
    fireEvent.click(parseBtn)

    await waitFor(() => {
      expect(screen.getByText('请输入 YouTube 视频链接')).toBeInTheDocument()
    })

    // API should not be called
    expect(mockGetVideoInfo).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid URL', async () => {
    renderWithQueryClient(<DownloadManager />)

    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    fireEvent.change(input, { target: { value: 'not-a-valid-url' } })

    const parseBtn = screen.getByRole('button', { name: /解析/i })
    fireEvent.click(parseBtn)

    await waitFor(() => {
      expect(screen.getByText('请输入有效的 YouTube 视频链接')).toBeInTheDocument()
    })

    // API should not be called
    expect(mockGetVideoInfo).not.toHaveBeenCalled()
  })

  it('shows loading state during API call', async () => {
    // Delay the mock to allow checking loading state
    mockGetVideoInfo.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => resolve({
        id: '123', title: 'Test', thumbnail: '', duration: 60, uploader: 'Test', formats: []
      }), 100)
    }))

    renderWithQueryClient(<DownloadManager />)

    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=123' } })

    const parseBtn = screen.getByRole('button', { name: /解析/i })
    fireEvent.click(parseBtn)

    // Loading state should appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /解析中/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /解析中/i })).toBeDisabled()
    })

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '解析' })).toBeInTheDocument()
    })
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

    renderWithQueryClient(<DownloadManager />)

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
    expect(screen.queryByText(/请输入/i)).not.toBeInTheDocument()
  })

  it('clears validation error when input changes', async () => {
    renderWithQueryClient(<DownloadManager />)

    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    const parseBtn = screen.getByRole('button', { name: /解析/i })

    // First trigger validation error
    fireEvent.click(parseBtn)
    await waitFor(() => {
      expect(screen.getByText('请输入 YouTube 视频链接')).toBeInTheDocument()
    })

    // Then type something - error should clear
    fireEvent.change(input, { target: { value: 'some text' } })

    expect(screen.queryByText('请输入 YouTube 视频链接')).not.toBeInTheDocument()
  })

  it('supports Enter key to submit', async () => {
    mockGetVideoInfo.mockResolvedValueOnce({
      id: '123',
      title: 'Test Video',
      thumbnail: '',
      duration: 60,
      uploader: 'Test',
      formats: []
    })

    renderWithQueryClient(<DownloadManager />)

    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=123' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(mockGetVideoInfo).toHaveBeenCalledWith('https://youtube.com/watch?v=123')
    })
  })
})
