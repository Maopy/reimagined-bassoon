import { useState } from 'react'
import { getVideoInfo } from '@/lib/api/youtube.service'
import type { VideoInfo } from '@/types/youtube'

export function DownloadManager() {
  const [url, setUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFetch = async () => {
    if (!url.trim()) return
    setIsLoading(true)
    setErrorMsg('')
    try {
      const info = await getVideoInfo(url)
      setVideoInfo(info)
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e.toString())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <div className='bg-card text-card-foreground rounded-xl border shadow-sm p-6'>
        <h2 className='text-2xl font-semibold leading-none tracking-tight mb-4'>YouTube 下载器</h2>
        <p className='text-muted-foreground text-sm mb-6'>输入 YouTube 视频链接进行解析和下载</p>

        {/* Input Area */}
        <div className='flex gap-2 mb-8'>
          <input
            type='text'
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={isLoading}
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
            placeholder='https://www.youtube.com/watch?v=...'
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          />
          <button
            onClick={handleFetch}
            disabled={isLoading}
            className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
          >
            {isLoading ? '解析中...' : '解析'}
          </button>
        </div>

        {errorMsg && (
          <div className='bg-destructive/15 text-destructive mb-8 rounded-md p-4 text-sm'>
            {errorMsg}
          </div>
        )}

        {/* Info Card */}
        <div className='bg-muted/50 rounded-xl p-8 flex border border-dashed'>
          {!videoInfo ? (
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
                  <p className='font-semibold mb-2'>找到 {videoInfo.formats.length} 个串流格式</p>
                  <p className='text-muted-foreground text-xs'>目前为预览阶段，下载功能即将加入</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
