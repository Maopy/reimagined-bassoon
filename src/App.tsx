import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { useNavigationStore } from '@/stores/navigation'
import { ROUTES } from '@/config/navigation'
import { ErrorBoundary } from '@/components/error-boundary'

export default function Page() {
  const { currentRoute } = useNavigationStore()
  const routeParams = ROUTES[currentRoute] || ROUTES['home']

  const currentPageTitle = routeParams.title
  const CurrentPage = routeParams.component

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <ErrorBoundary>
          {CurrentPage}
        </ErrorBoundary>
      </SidebarInset>
    </SidebarProvider>
  )
}
