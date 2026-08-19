const testimonials = [
  {
    quote:
      "Nexus replaced three different tools for us. Our team finally has one place to plan, track, and discuss work.",
    name: "Sarah Chen",
    role: "Engineering Manager",
    company: "Acme Corp",
  },
  {
    quote:
      "The simplicity is what sold us. We onboarded the entire team in a single afternoon and were up and running immediately.",
    name: "Marcus Rivera",
    role: "Product Lead",
    company: "Globex",
  },
  {
    quote:
      "We cut our sprint planning time in half. The visibility into project progress changed how we make decisions.",
    name: "Priya Sharma",
    role: "CTO",
    company: "Initech",
  },
];

export function TestimonialSection() {
  return (
    <section className="bg-base-100 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            Teams love working with Nexus
          </h2>
          <p className="mt-4 text-lg text-base-content/60">
            Hear from teams that made the switch.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col rounded-2xl border border-base-200 bg-base-100 p-6 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-4 w-4 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-base-content/70">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 border-t border-base-200 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-base-content">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-base-content/50">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
