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
