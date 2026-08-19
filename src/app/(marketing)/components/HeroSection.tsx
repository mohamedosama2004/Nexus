import Link from "next/link";
import { HeroMockup } from "./HeroMockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-base-100 pb-16 pt-20 lg:pb-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-base-content sm:text-5xl lg:text-6xl">
            Plan, track, and ship{" "}
            <span className="text-primary">better work</span> with your team
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-base-content/60">
            Nexus brings your projects, tasks, and team collaboration into one
            place. Organize work across teams, track progress in real time, and
            deliver on schedule — every time.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="btn btn-primary px-8 text-base">
              Get started — it&apos;s free
            </Link>
            <Link href="#product-showcase" className="btn btn-ghost px-8 text-base">
              See how it works
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl lg:mt-20">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
