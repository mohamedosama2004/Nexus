"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

type PageItem = number | "ellipsis";

function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const visible = new Set<number>(
    [1, current - 1, current, current + 1, total].filter(
      (page) => page >= 1 && page <= total,
    ),
  );

  const sorted = [...visible].sort((a, b) => a - b);

  const items: PageItem[] = [];
  let previous = 0;

  for (const page of sorted) {
    if (previous && page - previous > 1) {
      items.push(page - previous > 2 ? "ellipsis" : previous + 1);
    }
    items.push(page);
    previous = page;
  }

  return items;
}

export default function ProjectsPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalItems === 0) {
    return null;
  }

  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname!, {
      scroll: false,
    });
  }

  const itemBase =
    "flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors";
  const idleClass =
    "border-base-200 bg-base-100 text-base-content/60 hover:border-primary/40 hover:text-primary";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-base-content/50">
        Showing{" "}
        <span className="font-semibold text-base-content/70">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-base-content/70">
          {totalItems}
        </span>{" "}
        {totalItems === 1 ? "project" : "projects"}
      </p>

      {totalPages > 1 && (
        <nav
          aria-label="Projects pagination"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={`${itemBase} ${
              currentPage === 1
                ? "cursor-not-allowed border-base-200 bg-base-100 text-base-content/30"
                : idleClass
            }`}
          >
            <ChevronLeftIcon className="size-4" />
          </button>

          {buildPageItems(currentPage, totalPages).map((item, index) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => goToPage(item)}
                aria-current={item === currentPage ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={`${itemBase} ${
                  item === currentPage
                    ? "border-primary/40 bg-primary/10 font-semibold text-primary"
                    : idleClass
                }`}
              >
                {item}
              </button>
            ) : (
              <span
                key={`${item}-${index}`}
                className="flex size-9 items-center justify-center text-sm text-base-content/40"
              >
                …
              </span>
            ),
          )}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={`${itemBase} ${
              currentPage === totalPages
                ? "cursor-not-allowed border-base-200 bg-base-100 text-base-content/30"
                : idleClass
            }`}
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
