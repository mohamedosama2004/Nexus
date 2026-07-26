import SideNavbar from "@/app/(application)/_components/SideNavbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="bg-gray-900 p-4 text-white shadow-sm">
        <h2 className="text-xl font-bold">Nexus Dashboard</h2>
      </header>
      <div className="flex flex-1">
        <SideNavbar />
        <main className="flex-1 p-6 ">{children}</main>
      </div>
    </div>
  );
}
