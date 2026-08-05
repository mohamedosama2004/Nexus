import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Project Not Found</h1>

      <p className="text-base-content/70">
        This project not exist or may have been deleted.
      </p>

      <Link href="/projects" className="btn btn-primary">
        Back to Projects
      </Link>
    </div>
  );
}
