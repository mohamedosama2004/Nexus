export default async function ProjectsList() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <div className="rounded-box border p-4">
      Projects Loaded
    </div>
  );
}