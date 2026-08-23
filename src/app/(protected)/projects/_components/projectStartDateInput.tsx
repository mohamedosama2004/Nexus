type Props = {
  error?: string | null;
  defaultValue?: string;
};

export default function ProjectStartDateInput({ error, defaultValue }: Props) {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="startDate">
        <span className="label-text font-medium">Start Date</span>
      </label>
      <input
        type="date"
        id="startDate"
        name="startDate"
        className="input input-bordered w-full"
        defaultValue={defaultValue}
      />
      {error && <p className="text-error">{error}</p>}
    </div>
  );
}
