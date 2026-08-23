"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HomeIcon,
  FolderIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
  
} from "@heroicons/react/24/outline";

type SidebarProject = {
  id: string;
  title: string;
};

const links = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { label: "Members", href: "/dashboard/members", icon: UsersIcon },
  { label: "Projects", href: "/projects", icon: FolderIcon },
  { label: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function SideNavbar({
  projects = [],
}: {
  projects?: SidebarProject[];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(
    () => pathname.startsWith("/projects/")
  );


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
            const isProjectsItem = link.href === "/projects";
            return (
              <div key={link.href}>
                <div
                  className={
                    isProjectsItem && isOpen ? "flex items-center gap-1" : undefined
                  }
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    title={!isOpen ? link.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                    } ${!isOpen && "justify-center px-2"} ${
                      isProjectsItem && isOpen && "min-w-0 flex-1"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {isOpen && <span>{link.label}</span>}
                  </Link>
                  {isProjectsItem && isOpen && (
                    <button
                      type="button"
                      onClick={() => setIsProjectsExpanded((prev) => !prev)}
                      aria-expanded={isProjectsExpanded}
                      aria-label={isProjectsExpanded ? "Collapse projects" : "Expand projects"}
                      className="rounded-md p-1.5 text-base-content/40 transition-colors hover:bg-base-200 hover:text-base-content"
                    >
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isProjectsExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {isProjectsItem && (
                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      isProjectsExpanded && isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      {isProjectsExpanded && isOpen && projects.length > 0 && (
                        <ul className="ml-[26px] mt-0.5 max-h-64 space-y-0.5 overflow-y-auto border-l border-base-200 pb-1 pl-2 pr-1">
                          {projects.map((project) => {
                            const projectHref = `/projects/${project.id}`;
                            const isProjectActive = pathname === projectHref;
                            return (
                              <li key={project.id}>
                                <Link
                                  href={projectHref}
                                  onClick={() => setMobileOpen(false)}
                                  className={`block truncate rounded-md px-2 py-1.5 text-sm transition-colors ${
                                    isProjectActive
                                      ? "bg-primary/5 font-medium text-primary"
                                      : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                                  }`}
                                >
                                  {project.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

       
      </aside>
    </>
  );
}
