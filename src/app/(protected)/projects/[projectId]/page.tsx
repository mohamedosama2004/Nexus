import { getProjectById } from "@/src/lib/data/projects";
import { notFound } from "next/navigation";
import ProjectHeader from "./_components/projectHeader";
import ProjectStats from "./_components/projectStats";
import ProjectTasks from "./_components/projectTasks";
import BackButton from "@/src/components/BackButton";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <BackButton>back to Projects</BackButton>
      <ProjectHeader project={project} />
      <ProjectStats tasks={project.tasks} />
      <ProjectTasks projectId={project.id} tasks={project.tasks} />
    </div>
  );
}
