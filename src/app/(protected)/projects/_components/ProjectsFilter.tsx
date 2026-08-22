"use client";
import { useRouter, useSearchParams } from "next/navigation";

const ProjectsView = () => {
  type View ="grid" |"list"  ;
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") ?? "list";
  const handleView = (newView: View) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`?${params.toString()}`);
  };
  return (
    <div>
      <button className="btn" onClick={()=>handleView('grid')}>grid</button>
      <button className="btn" onClick={()=>handleView('list')}>list</button>
      <p> current View : {view}</p>
    </div>
  );
};

export default ProjectsView;
