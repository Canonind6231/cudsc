import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const StatsCardSkeleton = () => (
  <div className="rounded-xl border border-border/50 bg-card p-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-12" />
      </div>
      <Skeleton className="h-12 w-12 rounded-lg" />
    </div>
  </div>
);

const ProjectCardSkeleton = () => (
  <Card className="border-border/50 bg-card">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Header skeleton */}
    <header className="gradient-header sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32 bg-white/20" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20 bg-white/20 rounded-md" />
            <Skeleton className="h-9 w-36 bg-white/20 rounded-md" />
          </div>
        </div>
      </div>
    </header>

    <main className="container mx-auto px-4 py-8">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Projects section skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-48" />
        </div>

        <Skeleton className="h-10 w-full max-w-md" />

        {/* Tab bar skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>

        {/* Project cards skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default DashboardSkeleton;
