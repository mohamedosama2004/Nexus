type Props = {
  error: string | null;
  defaultValue?: string;
};

export default function TaskTitleInput({ error, defaultValue }: Props) {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="title">
        <span className="label-text font-medium">Title</span>
      </label>
      <input
        type="text"
        id="title"
        name="title"
        placeholder="e.g. Design the landing page"
        className="input input-bordered w-full"
        defaultValue={defaultValue}
        required
      />
      {error && <p className="text-error">{error}</p>}
    </div>
  );
}
