import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-base-200/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary-content sm:text-4xl">
            Ready to bring your team&apos;s work together?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-content/80">
            Start for free — no credit card required. Set up your first
            workspace in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="btn btn-lg border-0 bg-base-100 text-base-content hover:bg-base-200"
            >
              Get started
            </Link>
            <Link
              href="/about"
              className="btn btn-lg btn-ghost text-primary-content hover:bg-primary-content/10"
            >
              Explore Nexus
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
