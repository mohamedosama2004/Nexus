import Link from "next/link";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <Link href="/" className="text-2xl font-bold text-primary">
            Nexus
          </Link>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/about" className="btn btn-ghost btn-sm">
            About
          </Link>
          <Link href="/pricing" className="btn btn-ghost btn-sm">
            Pricing
          </Link>
          <Link href="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
