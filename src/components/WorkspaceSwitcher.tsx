"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  CheckIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

type Workspace = {
  id: string;
  name: string;
  role: string;
};

const WORKSPACE_CHANGE_EVENT = "workspace-change";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchWorkspaces = useCallback(async () => {
    const response = await fetch("/api/workspaces");

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    setWorkspaces(data.workspaces);
    setCurrentId(data.currentWorkspace);
  }, []);

  useEffect(() => {
    async function load() {
      await fetchWorkspaces();
    }

    load();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const currentWorkspace = workspaces.find((w) => w.id === currentId);

  const handleSwitch = async (workspaceId: string) => {
    if (workspaceId === currentId || switching) return;

    setSwitching(true);
    try {
      const response = await fetch("/api/workspaces/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      if (!response.ok) {
        return;
      }

      setCurrentId(workspaceId);
      setOpen(false);
      window.dispatchEvent(new Event(WORKSPACE_CHANGE_EVENT));
      router.refresh();
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Switch workspace"
        className="flex h-10 items-center gap-2 rounded-lg border border-base-200 bg-base-100 px-3 text-sm font-medium text-base-content transition-colors hover:bg-base-200"
      >
        <BuildingOffice2Icon className="h-4 w-4 text-base-content/50" />
        <span className="max-w-40 truncate">
          {currentWorkspace?.name ?? "Workspace"}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-base-content/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 origin-top-left overflow-hidden rounded-xl border border-base-200 bg-base-100 shadow-xl">
          <div className="border-b border-base-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-base-content/40">
            Workspaces
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {workspaces.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-base-content/50">
                No workspaces yet
              </div>
            ) : (
              workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSwitch(workspace.id)}
                  disabled={switching}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-base-200 ${
                    workspace.id === currentId
                      ? "font-semibold text-primary"
                      : "text-base-content/70"
                  }`}
                >
                  <span className="truncate">{workspace.name}</span>
                  {workspace.id === currentId && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
