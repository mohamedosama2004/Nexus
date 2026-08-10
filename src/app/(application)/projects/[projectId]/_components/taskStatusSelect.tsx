const taskStatuses = ["active", "completed", "TODO"] as const;

export default function TaskStatusSelect() {
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
        {taskStatuses.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
