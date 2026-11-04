import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPost() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-4 w-32" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-10 w-4/5" />
          <Skeleton className="mt-2 h-10 w-3/5" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="mt-6 aspect-[16/8] w-full rounded-2xl" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className={index % 3 === 2 ? "h-4 w-3/4" : "h-4 w-full"} />
            ))}
          </div>
        </div>
        <div className="hidden space-y-5 lg:block">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
