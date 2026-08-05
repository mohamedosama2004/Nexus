import ProjectCardSkeleton from "../../../components/skeletons/projectCardSkeleton";

export default function ProjectsLoadingSkeleton() {
  const CARD_COUNT = 6;
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded-full" />
      </div>

      <div className="flex gap-3">
        <div className="skeleton h-12 flex-1 rounded-box" />
        <div className="skeleton h-12 w-32 rounded-box" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
