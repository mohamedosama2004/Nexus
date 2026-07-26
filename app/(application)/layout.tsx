import Navbar from "@/app/(application)/_components/Navbar";
import SideNavbar from "@/app/(application)/_components/SideNavbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Navbar />
      <div className="flex flex-1">
        <SideNavbar />
        <main className="flex-1 p-6 ">{children}</main>
      </div>
    </div>
  );
}
