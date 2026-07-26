import ProjectsView from "@/app/(application)/_components/ProjectsFilter";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return (
    <div>
      <p>project :{projectId}</p>
      <ProjectsView />
    </div>
  );
}


