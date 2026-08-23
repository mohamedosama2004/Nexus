"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowsUpDownIcon,
  CheckIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ProjectViewToggle, { type ProjectView } from "./projectViewToggle";

type StatusFilter = "all" | "active" | "completed";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "updated", label: "Recently updated" },
  { value: "dueDate", label: "Due date" },
  { value: "startDate", label: "Start date" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const SEARCH_DEBOUNCE_MS = 300;

function DropdownButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      tabIndex={0}
      role="button"
      className="btn h-10 min-w-32 justify-between rounded-lg border-base-200 bg-base-100 px-3.5 font-normal hover:border-primary/40 hover:bg-base-100"
    >
      <span className="flex items-center gap-2">
        <span className="text-base-content/40">{icon}</span>
        <span className="capitalize">{label}</span>
      </span>
      <ChevronDownIcon className="size-4 text-base-content/40" />
    </div>
  );
}

function SearchFilters({
  currentStatus,
  currentSort,
}: {
  currentStatus?: "active" | "completed";
  currentSort?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const status: StatusFilter = currentStatus ?? "all";
  const sort = (
    SORT_OPTIONS.find((option) => option.value === currentSort)?.value ??
    "newest"
  ) as SortValue;

  const initialQuery = searchParams.get("query") ?? "";
  const [term, setTerm] = useState(initialQuery);
  const initialQueryRef = useRef(initialQuery);

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const queryString = params.toString();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    router.push(queryString ? `${pathname}?${queryString}` : pathname!);
  }

  useEffect(() => {
    if (term === initialQueryRef.current) return;

    const timeout = setTimeout(() => {
      initialQueryRef.current = term;
      const params = new URLSearchParams(searchParams.toString());

      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }

      params.delete("page");

      const queryString = params.toString();
      router.replace(
        queryString ? `${pathname}?${queryString}` : pathname!,
        { scroll: false },
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [term, router, pathname, searchParams]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <ProjectViewToggle
          value={(searchParams.get("view") === "list"
            ? "list"
            : "grid") as ProjectView}
        />

        <div className="dropdown dropdown-bottom">
          <DropdownButton icon={<FunnelIcon />} label={status} />
          <ul
            tabIndex={0}
            className="dropdown-content menu z-20 mt-1 w-44 rounded-xl border border-base-200 bg-base-100 p-1 shadow-lg"
          >
            {STATUS_OPTIONS.map((option) => {
              const isActive = option.value === status;

              return (
                <li key={option.value}>
                  <button
                    onClick={() =>
                      navigate((params) => {
                        if (option.value === "all") {
                          params.delete("status");
                        } else {
                          params.set("status", option.value);
                        }
                      })
                    }
                    className={`flex items-center justify-between ${
                      isActive ? "bg-primary/5 font-medium text-primary" : ""
                    }`}
                  >
                    {option.label}
                    {isActive && <CheckIcon className="size-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="dropdown dropdown-bottom">
          <DropdownButton
            icon={<ArrowsUpDownIcon />}
            label={SORT_OPTIONS.find((option) => option.value === sort)!.label}
          />
          <ul
            tabIndex={0}
            className="dropdown-content menu z-20 mt-1 w-48 rounded-xl border border-base-200 bg-base-100 p-1 shadow-lg"
          >
            {SORT_OPTIONS.map((option) => {
              const isActive = option.value === sort;

              return (
                <li key={option.value}>
                  <button
                    onClick={() =>
                      navigate((params) => {
                        if (option.value === "newest") {
                          params.delete("sort");
                        } else {
                          params.set("sort", option.value);
                        }
                      })
                    }
                    className={`flex items-center justify-between ${
                      isActive ? "bg-primary/5 font-medium text-primary" : ""
                    }`}
                  >
                    {option.label}
                    {isActive && <CheckIcon className="size-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <label className="input h-10 w-full items-center gap-2 rounded-lg border-base-200 bg-base-100 focus-within:border-primary/40 lg:ml-auto lg:w-72">
        <MagnifyingGlassIcon className="size-4 shrink-0 opacity-60" />
        <input
          type="search"
          placeholder="Search projects"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          className="grow bg-transparent outline-none"
          aria-label="Search projects"
        />
      </label>
    </div>
  );
}

export default SearchFilters;
