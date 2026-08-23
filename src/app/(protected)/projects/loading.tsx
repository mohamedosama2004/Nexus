import ProjectCardSkeleton from "../../../components/skeletons/projectCardSkeleton";

export default function ProjectsLoadingSkeleton() {
  const CARD_COUNT = 6;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded-full" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-2">
          <div className="skeleton h-11 w-20 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-full rounded-lg lg:ml-auto lg:w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="skeleton h-4 w-44 rounded-full" />
        <div className="flex gap-1.5">
          <div className="skeleton size-9 rounded-lg" />
          <div className="skeleton size-9 rounded-lg" />
          <div className="skeleton size-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
