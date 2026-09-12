import { getAttachments, type WorkspaceAttachment } from "@/src/lib/data/attachments";
import { getUsers } from "@/src/lib/data/members";
import { UserAvatar } from "@/src/components/UserAvatar";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
                <UserAvatar
                  name={user.name}
                  storageKey={user.avatarFile?.storageKey ?? null}
                  alt={user.name}
                  className="size-10 bg-primary/10 text-primary"
                  textClassName="text-sm font-semibold"
                  fallback="initials"
                />
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
          {attachments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-base-300 px-4 py-8 text-center text-sm text-base-content/50">
              No attachments yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {attachments.slice(0, 8).map((attachment) => (
                <AttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AttachmentCard({ attachment }: { attachment: WorkspaceAttachment }) {
  return (
    <a
      href={`/api/files/${attachment.storageKey}`}
      target="_blank"
      rel="noopener noreferrer"
      title={`${attachment.task?.title ?? "Attachment"} — ${attachment.originalName}`}
      className="flex min-h-full flex-col rounded-lg border border-base-200 bg-base-200/30 p-3 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <p className="text-sm font-medium text-base-content line-clamp-2">
        {attachment.originalName}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs text-base-content/40">
        <span>{formatBytes(attachment.size)}</span>
        <span className="truncate">
          in {attachment.task?.title ?? "a task"}
        </span>
      </div>
    </a>
  );
}