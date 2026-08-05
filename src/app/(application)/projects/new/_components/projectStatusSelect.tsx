import { ProjectStatus } from "@/src/lib/definitions";

const statuses: ProjectStatus[] = ["active", "completed"];

export default function ProjectStatusSelect() {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="status">
        <span className="label-text font-medium">Status</span>
      </label>
      <select
        id="status"
        name="status"
        className="select select-bordered w-full"
        defaultValue="active"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
