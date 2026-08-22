type BoardProgressProps = {
  total: number;
  completed: number;
};

export function BoardProgress({ total, completed }: BoardProgressProps) {
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-base-content">
          Overall progress
        </span>
        <span className="font-semibold text-primary">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-base-200">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
