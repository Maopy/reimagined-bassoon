'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'

import { useNavigationStore } from '@/stores/navigation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'

export function NavMain({
  items
}: {
  items: {
    title: string
    id: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      id: string
    }[]
  }[]
}) {
  const { setCurrentRoute } = useNavigationStore()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map(item => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <button
                  className='flex w-full items-center text-left'
                  onClick={e => {
                    e.preventDefault()
                    if (!item.items?.length && item.id) {
                      setCurrentRoute(item.id)
                    }
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className='data-[state=open]:rotate-90'>
                      <ChevronRight />
                      <span className='sr-only'>Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <button
                              className='flex w-full items-center text-left'
                              onClick={e => {
                                e.preventDefault()
                                setCurrentRoute(subItem.id)
                              }}
                            >
                              <span>{subItem.title}</span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
