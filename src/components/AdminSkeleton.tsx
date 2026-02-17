import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const AdminSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Header skeleton */}
    <header className="gradient-header sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32 bg-white/20" />
            <Skeleton className="h-5 w-40 bg-white/20 rounded-md hidden md:block" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20 bg-white/20 rounded-md" />
            <Skeleton className="h-9 w-40 bg-white/20 rounded-md" />
          </div>
        </div>
      </div>
    </header>

    <main className="container mx-auto px-4 py-8">
      {/* User management card skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent>
          {/* Search bar */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Table skeleton */}
          <div className="border rounded-lg">
            {/* Table header */}
            <div className="border-b px-4 py-3 flex gap-4">
              {[100, 140, 90, 80, 130, 70, 60].map((w, i) => (
                <Skeleton key={i} className="h-4" style={{ width: w }} />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b last:border-b-0 px-4 py-4 flex items-center gap-4">
                <div className="flex items-center gap-2 w-[160px]">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-[160px]" />
                <Skeleton className="h-4 w-[90px]" />
                <Skeleton className="h-6 w-[70px] rounded-full" />
                <Skeleton className="h-10 w-[150px] rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts skeleton */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity log skeleton */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
);

export default AdminSkeleton;
