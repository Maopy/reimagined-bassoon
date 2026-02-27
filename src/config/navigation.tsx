import { Settings2, DownloadCloud } from 'lucide-react'

import { Home } from '@/components/home'
import { DownloadManager } from '@/components/download-manager'

export interface RouteConfig {
  id: string
  title: string
  component: React.ReactNode
}

export const ROUTES: Record<string, RouteConfig> = {
  home: {
    id: 'home',
    title: 'Data Fetching',
    component: <Home />
  },
  youtube: {
    id: 'youtube',
    title: 'YouTube 下载',
    component: <DownloadManager />
  },
  settings: {
    id: 'settings',
    title: '设置',
    component: (
      <div className='p-4 flex items-center justify-center text-muted-foreground'>
        设置页面开发中...
      </div>
    )
  }
}

export const sidebarData = {
  user: {
    name: 'Antigravity',
    email: 'admin@reimagined-bassoon.local',
    avatar: '' // 留空或者填入你的默认头像
  },
  navMain: [
    {
      title: '视频下载',
      id: 'downloads',
      icon: DownloadCloud,
      isActive: true, // 默认展开
      items: [
        {
          title: ROUTES.youtube.title,
          id: ROUTES.youtube.id
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: ROUTES.settings.title,
      id: ROUTES.settings.id,
      icon: Settings2
    }
  ]
}
