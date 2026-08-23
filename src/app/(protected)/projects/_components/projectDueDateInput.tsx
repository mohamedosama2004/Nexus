type Props = {
  error?: string | null;
  defaultValue?: string;
};

export default function ProjectDueDateInput({ error, defaultValue }: Props) {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="dueDate">
        <span className="label-text font-medium">Due Date</span>
      </label>
      <input
        type="date"
        id="dueDate"
        name="dueDate"
        className="input input-bordered w-full"
        defaultValue={defaultValue}
      />
      {error && <p className="text-error">{error}</p>}
    </div>
  );
}
