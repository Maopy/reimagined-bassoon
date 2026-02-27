'use client'

import { getCurrentWindow } from '@tauri-apps/api/window'
import * as React from 'react'
import { Command } from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

import { useIsMac } from '@/hooks/use-platform'

import { cn } from '@/lib/utils'

import { sidebarData as data } from '@/config/navigation'

const appWindow = getCurrentWindow()

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMac = useIsMac()

  const handleAppDragging = (e: React.MouseEvent) => {
    appWindow.startDragging()
    e.stopPropagation()
  }

  return (
    <Sidebar className='select-none' onMouseDown={handleAppDragging} variant='inset' {...props}>
      <SidebarHeader
        className={cn(isMac ? 'mt-3' : '', 'pointer-events-auto')}
        onMouseDown={e => e.stopPropagation()}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='#'>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <Command className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Acme Inc</span>
                  <span className='truncate text-xs'>Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent onMouseDown={e => e.stopPropagation()}>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter onMouseDown={e => e.stopPropagation()}>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
