const companies = [
  { name: "Acme Corp", width: "w-24" },
  { name: "Globex", width: "w-20" },
  { name: "Initech", width: "w-22" },
  { name: "Umbrella", width: "w-24" },
  { name: "Hooli", width: "w-18" },
  { name: "Stark", width: "w-20" },
];

export function LogoCloud() {
  return (
    <section className="border-y border-base-200 bg-base-200/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-base-content/40">
          Trusted by teams building what comes next
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-2 text-base-content/25 transition-colors hover:text-base-content/40"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-content/5 font-bold text-sm">
                {company.name[0]}
              </div>
              <span className="text-lg font-semibold tracking-tight">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
