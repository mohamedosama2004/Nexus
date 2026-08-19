export default function HeaderSkeleton() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-4 w-56 rounded-lg" />
      </div>
      <div className="skeleton h-9 w-28 rounded-lg" />
    </header>
  );
}
