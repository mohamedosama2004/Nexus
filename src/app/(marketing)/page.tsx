"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md space-y-5">
            <h1 className="text-5xl font-bold">Nexus</h1>
            <p className="font-bold">Project Management Saas</p>
            <p>Manage projects, tasks , and teams in one place</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                router.push("/login");
              }}
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
