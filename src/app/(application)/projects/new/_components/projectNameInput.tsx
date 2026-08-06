type Props = {
   error: string | null;
};

export default function ProjectNameInput({error}:Props) {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="projectName">
        <span className="label-text font-medium">Project Name</span>
      </label>
      <input
        type="text"
        id="projectName"
        name="projectName"
        placeholder="e.g. Nexus Dashboard"
        className="input input-bordered w-full"
      />
        {error && (
            <p className="text-error">
               {error}
            </p>
         )}
    </div>
  );
}
