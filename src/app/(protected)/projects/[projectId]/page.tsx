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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);

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
  const boardKey = `${project.id}-${project.tasks.length}-${
    project.tasks.filter((t) => t.status === "completed").length
  }`;

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
