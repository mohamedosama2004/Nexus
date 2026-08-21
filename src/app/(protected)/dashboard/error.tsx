"use client";
type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function DashboardError({
  error,
  reset,
}: ErrorProps) {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center gap-4">

      <h2 className="text-2xl font-bold">
        Something went wrong
      </h2>

      <p className="text-base-content/70">
        {error.message}
      </p>

      <button
        className="btn btn-primary"
        onClick={reset}
      >
        Try Again
      </button>

    </div>
  );
}