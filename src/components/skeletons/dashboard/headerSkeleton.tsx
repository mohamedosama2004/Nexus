export default function HeaderSkeleton() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="skeleton h-8 w-44 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-28 rounded-full" />
    </header>
  );
}
