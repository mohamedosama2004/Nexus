import { getAttachments } from "@/src/lib/data/attachments";
import { getUsers } from "@/src/lib/data/members";

export default async function Activity() {
  const [users, attachments] = await Promise.all([
    getUsers(),
    getAttachments(),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Team Members */}
      <section className="rounded-xl border border-base-200 bg-base-100">
        <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
          <h2 className="text-base font-semibold text-base-content">Team Members</h2>
          <span className="rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-medium text-base-content/60">
            {users.length} users
          </span>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg border border-base-200 p-3 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-base-content">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-base-content/50">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attachments */}
      <section className="rounded-xl border border-base-200 bg-base-100">
        <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
          <h2 className="text-base font-semibold text-base-content">Attachments</h2>
          <span className="rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-medium text-base-content/60">
            {attachments.length} files
          </span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-2">
            {attachments.slice(0, 8).map((album) => (
              <div
                key={album.id}
                className="rounded-lg border border-base-200 bg-base-200/30 p-3 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <p className="text-sm font-medium text-base-content line-clamp-2">
                  {album.title}
                </p>
                <span className="mt-1 inline-block text-xs text-base-content/40">
                  #{album.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
