import { Skeleton } from "@/components/ui/skeleton"

export function ProductGridSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar Skeleton */}
                <div className="w-full md:w-64 space-y-6">
                    <Skeleton className="h-8 w-32" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <Skeleton className="h-8 w-full mt-8" />
                </div>

                {/* Product Grid Skeleton */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
                                <Skeleton className="h-48 w-full rounded-md" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6 bg-white rounded-lg border shadow-sm space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Charts/Table Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-[300px] w-full rounded-lg" />
                <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
        </div>
    )
}
