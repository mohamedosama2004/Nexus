import { getAttachments } from "@/src/lib/data/attachments";
import { getUsers } from "@/src/lib/data/members";

export default async function Activity() {
  const [users, attachments] = await Promise.all([
    getUsers(),
    getAttachments(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="card-title">
            Team Members
            <span className="badge badge-ghost">{users.length} users</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-box border border-base-200 p-4 transition-colors hover:border-primary/40 hover:bg-base-200/50"
              >
                <div className="avatar placeholder">
                  <div className="w-11 rounded-full bg-primary text-primary-content">
                    <span className="font-bold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-base-content truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-base-content/60 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="card-title">
            Attachments
            <span className="badge badge-ghost">{attachments.length} albums</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {attachments.slice(0, 8).map((album) => (
              <div
                key={album.id}
                className="rounded-box border border-base-200 bg-base-200/50 p-3"
              >
                <p className="text-sm font-medium text-base-content line-clamp-2">
                  {album.title}
                </p>
                <span className="mt-1 inline-block text-xs text-base-content/50">
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
