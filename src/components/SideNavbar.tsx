"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/src/actions/auth.actions";
import {
  HomeIcon,
  ChartBarIcon,
  FolderIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { label: "Analytics", href: "/dashboard/analytics", icon: ChartBarIcon },
  { label: "Projects", href: "/projects", icon: FolderIcon },
  { label: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function SideNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex size-10 items-center justify-center rounded-lg border border-base-200 bg-base-100 text-base-content shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-full flex-col border-r border-base-200 bg-base-100 transition-all duration-300 lg:relative lg:z-auto ${
          isOpen ? "w-64" : "w-[72px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className={`flex h-16 items-center border-b border-base-200 px-4 ${isOpen ? "justify-between" : "justify-center"}`}>
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-content">
              N
            </div>
            {isOpen && <span className="text-lg font-bold tracking-tight text-base-content">exus</span>}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden rounded-md p-1.5 text-base-content/40 transition-colors hover:bg-base-200 hover:text-base-content lg:flex"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <ChevronLeftIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <span className={`mb-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/40 ${!isOpen && "text-center"}`}>
            {isOpen ? "Menu" : "•••"}
          </span>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                title={!isOpen ? link.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                } ${!isOpen && "justify-center px-2"}`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {isOpen && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-base-200 p-3">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-base-content/60 transition-colors hover:bg-error/10 hover:text-error ${!isOpen && "justify-center px-2"}`}
            title={!isOpen ? "Log out" : undefined}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
            {isOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
