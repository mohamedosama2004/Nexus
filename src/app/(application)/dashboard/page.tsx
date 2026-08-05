import Activity from "./_components/activity";
import DashboardHeader from "./_components/header";
import Projects from "./_components/projects";
import Section from "./_components/section";
import Stats from "./_components/stats";
import Tasks from "./_components/tasks";
import ActivitySkeleton from "@/src/components/skeletons/dashboard/activitySkeleton";
import ProjectsSkeleton from "@/src/components/skeletons/dashboard/projectsSkeleton";
import StatsSkeleton from "@/src/components/skeletons/dashboard/statsSkeleton";
import TasksSkeleton from "@/src/components/skeletons/dashboard/tasksSkeleton";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <Section label="Stats" fallback={<StatsSkeleton />}>
        <Stats />
      </Section>

      <Section label="Projects" fallback={<ProjectsSkeleton />}>
        <Projects />
      </Section>

      <Section label="Tasks" fallback={<TasksSkeleton />}>
        <Tasks />
      </Section>

      <Section label="Activity" fallback={<ActivitySkeleton />}>
        <Activity />
      </Section>
    </div>
  );
}
