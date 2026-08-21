import ActivitySkeleton from "@/src/components/skeletons/dashboard/activitySkeleton";
import HeaderSkeleton from "@/src/components/skeletons/dashboard/headerSkeleton";
import ProjectsSkeleton from "@/src/components/skeletons/dashboard/projectsSkeleton";
import StatsSkeleton from "@/src/components/skeletons/dashboard/statsSkeleton";
import TasksSkeleton from "@/src/components/skeletons/dashboard/tasksSkeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <StatsSkeleton />
      <ProjectsSkeleton />
      <TasksSkeleton />
      <ActivitySkeleton />
    </div>
  );
}
