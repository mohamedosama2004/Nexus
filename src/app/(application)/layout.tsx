import SideNavbar from "@/src/components/SideNavbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className=" min-h-screen flex flex-1">
      <SideNavbar />
      <main className="flex-1 p-6 ">{children}</main>
    </div>
  );
}
