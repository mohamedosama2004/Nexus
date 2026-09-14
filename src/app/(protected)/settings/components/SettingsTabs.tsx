"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export type SettingsTabId = "workspace" | "security";

type SettingsTabsProps = {
  activeTab: SettingsTabId;
};

const TABS: { id: SettingsTabId; label: string }[] = [
  { id: "workspace", label: "Workspace" },
  { id: "security", label: "Security" },
];

/**
 * URL-driven tab bar. Each tab is a real link (`/settings?tab=...`) so the
 * active tab survives refreshes and supports browser back/forward. The active
 * state is resolved server-side from `searchParams`; this is a thin client
 * shell only so arrow-key navigation can move focus with a roving tabindex.
 */
export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  const router = useRouter();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);

  function activate(index: number) {
    const next = TABS[index];
    if (!next) return;
    router.push(`/settings?tab=${next.id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const lastIndex = TABS.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (activeIndex + 1) % TABS.length;
        break;
      case "ArrowLeft":
        nextIndex = (activeIndex - 1 + TABS.length) % TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    activate(nextIndex);
  }

  return (
    <nav
      role="tablist"
      aria-label="Settings sections"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className="flex items-center gap-1 overflow-x-auto border-b border-base-200"
    >
      {TABS.map((tab, index) => {
        const active = tab.id === activeTab;

        return (
          <Link
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            href={`/settings?tab=${tab.id}`}
            role="tab"
            id={`${tab.id}-tab`}
            aria-selected={active}
            aria-controls={`${tab.id}-panel`}
            tabIndex={active ? 0 : -1}
            className={`-mb-px inline-flex shrink-0 items-center justify-center whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
              active
                ? "border-primary font-semibold text-primary"
                : "border-transparent text-base-content/50 hover:border-base-300 hover:text-base-content"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}