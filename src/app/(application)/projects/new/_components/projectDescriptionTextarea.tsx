export default function ProjectDescriptionTextarea() {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="description">
        <span className="label-text font-medium">Description</span>
      </label>
      <textarea
        id="description"
        name="description"
        placeholder="Describe what this project is about"
        className="textarea textarea-bordered w-full"
        rows={4}
        required
      />
    </div>
  );
}
