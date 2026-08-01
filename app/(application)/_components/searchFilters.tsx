"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";

const SearchFilters = () => {
  type Status = "all" | "active" | "completed";
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentStatus = (searchParams.get("status") as Status) || "all";

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`?${params.toString()}`);
  };

  const handleStatus = (newStatus: Status) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", newStatus);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 shrink-0 gap-2">
      <div className="dropdown dropdown-bottom">
        <div tabIndex={0} role="button" className="btn btn-outline capitalize min-w-28">
          {currentStatus}
        </div>
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-40 p-2 shadow-sm">
          <li>
            <button onClick={() => handleStatus("all")}>All</button>
          </li>
          <li>
            <button onClick={() => handleStatus("active")}>Active</button>
          </li>
          <li>
            <button onClick={() => handleStatus("completed")}>Completed</button>
          </li>
        </ul>
      </div>

      <label className="input input-bordered flex items-center gap-2 flex-1">
        <input
          className="grow"
          placeholder="Search projects"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get("search")?.toString()}
        />
        <MagnifyingGlassIcon className="h-[18px] w-[18px] opacity-70" />
      </label>
    </div>
  );
};
export default SearchFilters;

