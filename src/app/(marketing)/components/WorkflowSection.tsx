import {
  LightBulbIcon,
  CommandLineIcon,
  RocketLaunchIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    icon: <LightBulbIcon className="h-6 w-6" />,
    number: "01",
    title: "Plan",
    description: "Define goals, set milestones, and break big ideas into actionable work.",
  },
  {
    icon: <CommandLineIcon className="h-6 w-6" />,
    number: "02",
    title: "Organize",
    description: "Structure projects, assign owners, and prioritize what matters most.",
  },
  {
    icon: <RocketLaunchIcon className="h-6 w-6" />,
    number: "03",
    title: "Execute",
    description: "Track progress in real time, unblock fast, and keep momentum going.",
  },
  {
    icon: <FlagIcon className="h-6 w-6" />,
    number: "04",
    title: "Ship",
    description: "Deliver on time, measure results, and carry lessons into the next cycle.",
  },
];

export function WorkflowSection() {
  return (
    <section className="bg-base-200/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            From idea to delivery
          </h2>
          <p className="mt-4 text-lg text-base-content/60">
            A clear workflow that keeps your team focused on what matters at
            every stage.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+32px)] top-6 hidden h-px w-[calc(100%-64px)] bg-base-300 lg:block" />
              )}

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-base-100 text-primary shadow-sm ring-1 ring-base-200">
                {step.icon}
              </div>
              <div className="mb-1 text-xs font-bold uppercase tracking-widest text-primary/60">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-base-content">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-base-content/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
