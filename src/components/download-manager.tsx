import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useVideoInfo } from '@/hooks/use-video-info'
import { useDebounce } from '@/hooks/use-debounce'
import { isValidYouTubeUrl, getErrorMessage } from '@/lib/validators'
import { VideoInfoSkeleton } from './video-info-skeleton'

export function DownloadManager() {
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState('')

  // 使用防抖优化验证体验
  const debouncedUrl = useDebounce(url, 300)

  // 防抖后自动验证
  useEffect(() => {
    if (debouncedUrl && !isValidYouTubeUrl(debouncedUrl)) {
      // 只显示格式错误，不显示空错误
      setValidationError('链接格式不正确，请检查')
    } else if (debouncedUrl && isValidYouTubeUrl(debouncedUrl)) {
      // 清除错误当格式正确
      setValidationError('')
    }
  }, [debouncedUrl])

  // 使用 React Query 获取视频信息
  const {
    data: videoInfo,
    isLoading,
    error: fetchError,
    refetch,
  } = useVideoInfo(url)

  // 处理获取视频信息
  const handleFetch = useCallback(() => {
    const trimmedUrl = url.trim()

    if (!trimmedUrl) {
      setValidationError('请输入 YouTube 视频链接')
      return
    }

    if (!isValidYouTubeUrl(trimmedUrl)) {
      setValidationError('请输入有效的 YouTube 视频链接')
      return
    }

    setValidationError('')
    refetch()
  }, [url, refetch])

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleFetch()
      }
    },
    [handleFetch]
  )

  // 清除输入时清除错误
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    if (validationError) {
      setValidationError('')
    }
  }, [validationError])

  // 合并验证错误和获取错误
  const displayError = validationError || (fetchError ? getErrorMessage(fetchError) : '')

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <div className='bg-card text-card-foreground rounded-xl border shadow-sm p-6'>
        <h2 className='text-2xl font-semibold leading-none tracking-tight mb-4'>
          YouTube 下载器
        </h2>
        <p className='text-muted-foreground text-sm mb-6'>
          输入 YouTube 视频链接进行解析和下载
        </p>

        {/* Input Area */}
        <div className='flex gap-2 mb-8'>
          <Input
            type='text'
            value={url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder='https://www.youtube.com/watch?v=...'
            className='flex-1'
          />
          <Button onClick={handleFetch} disabled={isLoading}>
            {isLoading ? '解析中...' : '解析'}
          </Button>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className='bg-destructive/15 text-destructive mb-8 rounded-md p-4 text-sm'>
            {displayError}
          </div>
        )}

        {/* Info Card */}
        <div className='bg-muted/50 rounded-xl p-8 flex border border-dashed'>
          {isLoading ? (
            <VideoInfoSkeleton />
          ) : !videoInfo ? (
            <div className='flex flex-1 items-center justify-center'>
              <p className='text-muted-foreground'>视频信息将显示在这里</p>
            </div>
          ) : (
            <div className='flex gap-6 w-full'>
              {videoInfo.thumbnail && (
                <img
                  src={videoInfo.thumbnail}
                  alt='thumbnail'
                  className='w-[320px] aspect-video object-cover rounded-lg shadow-sm'
                />
              )}
              <div className='flex flex-col flex-1'>
                <h3 className='text-xl font-bold mb-2'>{videoInfo.title}</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  {videoInfo.uploader} • {Math.round(videoInfo.duration / 60)} 分钟
                </p>
                <div className='text-sm'>
                  <p className='font-semibold mb-2'>
                    找到 {videoInfo.formats.length} 个串流格式
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    目前为预览阶段，下载功能即将加入
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
