import { getAttachments } from "@/src/lib/data/attachments";
import { getUsers } from "@/src/lib/data/members";
import { getProjects } from "@/src/lib/data/projects";
import { getTasks } from "@/src/lib/data/tasks";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  FolderIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const statConfig = [
  { label: "Total Users", icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Projects", icon: FolderIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Tasks", icon: CheckCircleIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Attachments", icon: DocumentTextIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
] as const;

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-base-200 bg-base-100 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex size-10 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-base-content">{value}</div>
        <div className="mt-0.5 text-sm text-base-content/50">{label}</div>
      </div>
    </div>
  );
}

export default async function Stats() {
  const [users, projects, tasks, attachments] = await Promise.all([
    getUsers(),
    getProjects(),
    getTasks(),
    getAttachments(),
  ]);
  const values = [users.length, projects.length, tasks.length, attachments.length];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={values[index]}
          icon={stat.icon}
          color={stat.color}
          bg={stat.bg}
        />
      ))}
    </div>
  );
}
