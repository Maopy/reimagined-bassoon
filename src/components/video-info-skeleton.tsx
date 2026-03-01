import { Skeleton } from '@/components/ui/skeleton'

export function VideoInfoSkeleton() {
  return (
    <div className="flex gap-6 w-full">
      <Skeleton className="w-[320px] aspect-video rounded-lg" />
      <div className="flex flex-col flex-1 gap-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  )
}
