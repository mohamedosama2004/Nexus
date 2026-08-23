"use client";

import { ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ProjectView = "grid" | "list";

const VIEWS: {
  value: ProjectView;
  label: string;
  icon: typeof Squares2X2Icon;
}[] = [
  { value: "grid", label: "Grid view", icon: Squares2X2Icon },
  { value: "list", label: "List view", icon: ListBulletIcon },
];

export default function ProjectViewToggle({ value }: { value: ProjectView }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function selectView(next: ProjectView) {
    if (next === value) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      role="group"
      aria-label="Switch projects view"
      className="flex items-center gap-0.5 rounded-lg border border-base-200 bg-base-100 p-0.5"
    >
      {VIEWS.map((item) => {
        const isActive = item.value === value;
        const Icon = item.icon;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => selectView(item.value)}
            aria-label={item.label}
            aria-pressed={isActive}
            title={item.label}
            className={`flex size-9 items-center justify-center rounded-md transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-base-content/50 hover:bg-base-200/60 hover:text-base-content"
            }`}
          >
            <Icon className="size-[18px]" />
          </button>
        );
      })}
    </div>
  );
}
