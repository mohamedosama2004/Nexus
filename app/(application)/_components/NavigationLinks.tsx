"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
];

export default function NavigationLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Main navigation">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            pathname === link.href
              ? "bg-white/10 text-white"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          }`}
          aria-current={pathname === link.href ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
