import { invoke } from '@tauri-apps/api/core'
import type { VideoInfo } from '@/types/youtube'

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  // Call the rust command. It returns a string because yt-dlp dumps a huge JSON.
  const rawJson = await invoke<string>('cmd_get_video_info', { url })
  const data = JSON.parse(rawJson)

  // Parse the yt-dlp dump to our standardized interface
  return {
    id: data.id || '',
    title: data.title || '',
    thumbnail: data.thumbnail || '',
    duration: data.duration || 0,
    uploader: data.uploader || '',
    formats: (data.formats || []).map((f: any) => ({
      format_id: f.format_id || '',
      ext: f.ext || '',
      resolution: f.resolution || 'audio only',
      filesize: f.filesize || f.filesize_approx || null,
      vcodec: f.vcodec || 'none',
      acodec: f.acodec || 'none'
    }))
  }
}
