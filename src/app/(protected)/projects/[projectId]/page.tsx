import { cache } from "react";
import type { Metadata } from "next";
import { getProjectById } from "@/src/lib/data/projects";
import { getUsers } from "@/src/lib/data/members";
import { getCurrentUser } from "@/src/lib/auth";
import { notFound } from "next/navigation";
import ProjectBoard from "./_components/board/ProjectBoard";
import BackButton from "@/src/components/buttons/BackButton";
import { InviteProjectMemberButton } from "./_components/InviteProjectMemberButton";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

// Deduplicates the project lookup so `generateMetadata` and the page render
// share a single query within the same request.
const fetchProject = cache((projectId: string) => getProjectById(projectId));

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = await fetchProject(projectId);

  if (!project) {
    notFound();
  }

  const description = project.description
    ? project.description.slice(0, 160)
    : "Manage tasks, members, and progress for this Nexus project.";

  return {
    title: project.title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await fetchProject(projectId);

  if (!project) {
    notFound();
  }

  const [currentUser, workspaceMembers] = await Promise.all([
    getCurrentUser(),
    getUsers(),
  ]);

  // Only workspace members who are not yet project members
  // (and not the current user) can be invited.
  const projectMemberUserIds = new Set(
    project.members.map((member) => member.user.id),
  );
  const invitableMembers = workspaceMembers.filter(
    (member) =>
      member.id !== currentUser?.id && !projectMemberUserIds.has(member.id),
  );

  // Changes whenever tasks are added/removed or move columns,
  // forcing the client board to remount with fresh server data.
  const attachmentCount = project.tasks.reduce(
    (total, task) => total + task.attachments.length,
    0,
  );
  const boardKey = `${project.id}-${project.tasks.length}-${
    project.tasks.filter((t) => t.status === "completed").length
  }-${attachmentCount}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BackButton>back to Projects</BackButton>
        <InviteProjectMemberButton
          projectId={projectId}
          members={invitableMembers}
        />
      </div>
      <ProjectBoard
        key={boardKey}
        project={project}
        projectId={projectId}
        tasks={project.tasks}
      />
    </div>
  );
}
