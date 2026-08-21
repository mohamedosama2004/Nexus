import { getCurrentUser } from "@/src/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser() ;
  if(user){
    redirect("/dashboard")
  }
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col w-full max-w-md">
        <div className="flex w-full justify-center ">
          <Link href="/" className="text-3xl font-bold text-primary ">
            Nexus
          </Link>
          
        </div>
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">{children}</div>
        </div>
        <p className="text-sm text-base-content/60">
          &copy; {new Date().getFullYear()} Nexus. All rights reserved.
        </p>
      </div>
    </div>
  );
}
