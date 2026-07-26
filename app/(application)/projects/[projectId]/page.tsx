import ProjectsFilter from "@/app/components/ProjectsFilter";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return <div>
    <p>project :{projectId}</p>
    <ProjectsFilter/>
    
  </div>;
}
