import ProjectsFilter from "@/app/components/ProjectsFilter";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
//   const {status='all' ,page="2"} =await searchParams
  return <div>
    <p>project :{projectId}</p>
    <ProjectsFilter/>
    
  </div>;
}
