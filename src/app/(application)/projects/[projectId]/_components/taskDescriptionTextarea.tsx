type Props = {
  defaultValue?: string;
};

export default function TaskDescriptionTextarea({ defaultValue }: Props) {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="description">
        <span className="label-text font-medium">Description</span>
      </label>
      <textarea
        id="description"
        name="description"
        placeholder="Describe what this task involves"
        className="textarea textarea-bordered w-full"
        rows={4}
        defaultValue={defaultValue}
      />
    </div>
  );
}
