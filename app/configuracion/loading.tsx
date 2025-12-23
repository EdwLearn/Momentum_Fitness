import { DashboardLayout } from "@/components/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 bg-sidebar-accent" />
          <Skeleton className="h-5 w-96 mt-2 bg-sidebar-accent" />
        </div>
        <Skeleton className="h-[600px] w-full bg-sidebar-accent" />
      </div>
    </DashboardLayout>
  )
}
