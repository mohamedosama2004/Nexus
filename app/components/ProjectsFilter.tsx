"use client";
import { useRouter, useSearchParams } from "next/navigation";

const ProjectsFilter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status") ?? "all";
  const handleStatus = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", newStatus);
    router.push(`?${params.toString()}`);
  };
  return (
    <div>
      <button className="btn" onClick={()=>handleStatus('active')}>active</button>
      <button className="btn" onClick={()=>handleStatus('completed')}>completed</button>
      <button className="btn" onClick={()=>handleStatus('all')}>all</button>
      <p> current filter : {status}</p>
    </div>
  );
};

export default ProjectsFilter;
