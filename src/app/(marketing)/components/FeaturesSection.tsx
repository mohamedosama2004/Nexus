import {
  FolderIcon,
  CheckCircleIcon,
  UsersIcon,
  RectangleStackIcon,
  ChartBarIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: <FolderIcon className="h-6 w-6" />,
    title: "Project Management",
    description:
      "Organize work into clear, manageable projects. Set goals, define scope, and keep every initiative on track from kickoff to delivery.",
  },
  {
    icon: <CheckCircleIcon className="h-6 w-6" />,
    title: "Task Tracking",
    description:
      "Break work into actionable tasks with priorities, deadlines, and statuses. Know exactly what's done, what's in progress, and what's next.",
  },
  {
    icon: <UsersIcon className="h-6 w-6" />,
    title: "Team Collaboration",
    description:
      "Assign work, share context, and keep everyone aligned. Your team stays connected without endless status meetings.",
  },
  {
    icon: <RectangleStackIcon className="h-6 w-6" />,
    title: "Workspaces",
    description:
      "Separate teams, departments, or clients into dedicated workspaces. Keep projects organized and access controls clean.",
  },
  {
    icon: <ChartBarIcon className="h-6 w-6" />,
    title: "Progress Insights",
    description:
      "See real-time progress across projects and tasks. Dashboards surface the metrics that matter so you can make faster decisions.",
  },
  {
    icon: <BoltIcon className="h-6 w-6" />,
    title: "Built for Speed",
    description:
      "A fast, keyboard-friendly interface designed for people who move fast. Less clicking, more shipping.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-base-100 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            Everything you need to deliver great work
          </h2>
          <p className="mt-4 text-lg text-base-content/60">
            Nexus gives your team a shared source of truth for projects, tasks,
            and progress — so nothing falls through the cracks.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
