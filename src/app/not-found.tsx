import Link from "next/link";

export default function NotFound() {
  return (
    <main className="hero min-h-screen bg-base-200 px-6">
      <div className="hero-content text-center">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body items-center gap-5">
            <div className="badge badge-primary badge-lg">404</div>
            <h1 className="text-4xl font-bold">Page not found</h1>
            <p className="text-base-content/70">
              The page you are looking for does not exist or may have been moved.
            </p>
            <div className="card-actions mt-2">
              <Link href="/dashboard" className="btn btn-primary">
                Return to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}