import * as React from 'react'
import { type LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { useNavigationStore } from '@/stores/navigation'

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    id: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { setCurrentRoute } = useNavigationStore()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size='sm'>
                <button
                  className='flex w-full items-center text-left'
                  onClick={() => {
                    if (item.id) {
                      setCurrentRoute(item.id)
                    }
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
