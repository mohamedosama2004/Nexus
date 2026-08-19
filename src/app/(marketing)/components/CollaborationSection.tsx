import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const benefits = [
  {
    icon: <UserGroupIcon className="h-5 w-5" />,
    title: "Assign ownership",
    description: "Every task has an owner. No ambiguity about who's responsible.",
  },
  {
    icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
    title: "Share context",
    description:
      "Keep conversations attached to the work itself — not buried in chat threads.",
  },
  {
    icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
    title: "Track accountability",
    description:
      "See who's working on what, when it's due, and whether it's on track.",
  },
  {
    icon: <ArrowPathIcon className="h-5 w-5" />,
    title: "Stay aligned",
    description:
      "Shared views keep everyone looking at the same priorities and progress.",
  },
];

export function CollaborationSection() {
  return (
    <section id="collaboration" className="bg-base-100 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Text */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
              Keep everyone moving in the same direction
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-base-content/60">
              Great teams don&apos;t just work hard — they work together. Nexus
              makes it easy to align on priorities, share context, and move work
              forward as one.
            </p>
            <div className="mt-10 flex flex-col gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base-content">
                      {benefit.title}
                    </h4>
                    <p className="mt-1 text-sm text-base-content/60">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="rounded-2xl border border-base-200 bg-base-200/30 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-base-content">
                Sprint Board
              </span>
              <span className="badge badge-primary badge-sm">Active</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Column 1 */}
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/40">
                  Backlog
                </div>
                {["Redesign login", "Dark mode", "API docs"].map((task) => (
                  <div
                    key={task}
                    className="mb-2 rounded-lg border border-base-200 bg-base-100 p-3"
                  >
                    <div className="text-xs font-medium text-base-content">
                      {task}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded bg-base-300 px-1.5 py-0.5 text-[9px] text-base-content/40">
                        Low
                      </span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary">
                        A
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2 */}
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-info">
                  In Progress
                </div>
                {["Dashboard v2", "Search feature"].map((task) => (
                  <div
                    key={task}
                    className="mb-2 rounded-lg border border-info/20 bg-base-100 p-3"
                  >
                    <div className="text-xs font-medium text-base-content">
                      {task}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded bg-info/10 px-1.5 py-0.5 text-[9px] text-info">
                        High
                      </span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-[8px] font-bold text-success">
                        J
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 3 */}
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-success">
                  Done
                </div>
                {["Auth flow", "Onboarding", "Pricing page"].map((task) => (
                  <div
                    key={task}
                    className="mb-2 rounded-lg border border-base-200 bg-base-100 p-3 opacity-70"
                  >
                    <div className="text-xs font-medium text-base-content/50 line-through">
                      {task}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded bg-success/10 px-1.5 py-0.5 text-[9px] text-success">
                        Done
                      </span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary">
                        T
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
