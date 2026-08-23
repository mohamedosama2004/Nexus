import SideNavbar from "@/src/components/Navs/SideNavbar";
import { TopHeader } from "@/src/app/(protected)/dashboard/_components/TopHeader";
import { getCurrentUser } from "@/src/lib/auth";
import { getProjects } from "@/src/lib/data/projects";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const projects = await getProjects();
  return (
    <div className="flex h-screen overflow-hidden bg-base-200/50">
      <SideNavbar projects={projects.map(({ id, title }) => ({ id, title }))} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
