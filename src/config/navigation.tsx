import { Settings2, DownloadCloud, type LucideIcon } from 'lucide-react'

import { Home } from '@/components/home'
import { DownloadManager } from '@/components/download-manager'

// 导航项类型定义
export interface NavItem {
  title: string
  id: string
  icon?: LucideIcon
  isActive?: boolean
  items?: Omit<NavItem, 'items' | 'icon'>[]
}

export interface RouteConfig {
  id: string
  title: string
  component: React.ReactNode
  nav?: {
    section: 'main' | 'secondary'
    icon?: LucideIcon
    parentId?: string // 用于子菜单
  }
}

// 路由配置 - 单一数据源
export const ROUTES: Record<string, RouteConfig> = {
  home: {
    id: 'home',
    title: 'Data Fetching',
    component: <Home />,
  },
  youtube: {
    id: 'youtube',
    title: 'YouTube 下载',
    component: <DownloadManager />,
    nav: {
      section: 'main',
      icon: DownloadCloud,
      parentId: 'downloads',
    },
  },
  settings: {
    id: 'settings',
    title: '设置',
    component: (
      <div className='p-4 flex items-center justify-center text-muted-foreground'>
        设置页面开发中...
      </div>
    ),
    nav: {
      section: 'secondary',
      icon: Settings2,
    },
  },
}

// 从 ROUTES 自动生成侧边栏导航
function generateSidebarData() {
  const navMain: NavItem[] = []
  const navSecondary: NavItem[] = []

  // 收集有 nav 配置的路由
  const routesWithNav = Object.values(ROUTES).filter((route) => route.nav)

  // 按 parentId 分组
  const childrenByParent = new Map<string, typeof routesWithNav>()
  const standaloneItems: typeof routesWithNav = []

  routesWithNav.forEach((route) => {
    if (route.nav?.parentId) {
      const existing = childrenByParent.get(route.nav.parentId) || []
      existing.push(route)
      childrenByParent.set(route.nav.parentId, existing)
    } else {
      standaloneItems.push(route)
    }
  })

  // 处理主菜单
  standaloneItems.forEach((route) => {
    if (route.nav?.section === 'main') {
      const children = childrenByParent.get(route.id)
      navMain.push({
        title: route.title,
        id: route.id,
        icon: route.nav.icon,
        isActive: children ? true : false,
        items: children?.map((child) => ({
          title: child.title,
          id: child.id,
        })),
      })
    }
  })

  // 处理子菜单项（如果 parent 不在 standalone 中）
  childrenByParent.forEach((children, parentId) => {
    if (!standaloneItems.find((r) => r.id === parentId)) {
      navMain.push({
        title: '视频下载',
        id: parentId,
        icon: DownloadCloud,
        isActive: true,
        items: children.map((child) => ({
          title: child.title,
          id: child.id,
        })),
      })
    }
  })

  // 处理次级菜单
  standaloneItems.forEach((route) => {
    if (route.nav?.section === 'secondary') {
      navSecondary.push({
        title: route.title,
        id: route.id,
        icon: route.nav.icon,
      })
    }
  })

  return {
    user: {
      name: 'Antigravity',
      email: 'admin@reimagined-bassoon.local',
      avatar: '',
    },
    navMain,
    navSecondary,
  }
}

export const sidebarData = generateSidebarData()
