import Link from "next/link";

export default function Home() {
  return (
    <main>
      <ul>
        <Link href="/dashboard" className="btn">
        dashboard
        </Link>
        <Link href="/dashboard/analytics" className="btn">
        analytics
        </Link>
        <Link href="/projects" className="btn">
        projects
        </Link>
        <Link href="/settings" className="btn">
        settings
        </Link>
        <Link href="/login" className="btn">
        Login
        </Link>
      </ul>
     <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md space-y-5">
            <h1 className="text-5xl font-bold">
              Nexus
            </h1>
            <p className="font-bold">
              Project Management Saas
            </p>
             <p>
                Manage projects, tasks , and teams in one place
              </p>
            <button className="btn btn-primary">
              Get started
            </button>
          </div>
        </div>
     </div>
    </main>
  );
}
