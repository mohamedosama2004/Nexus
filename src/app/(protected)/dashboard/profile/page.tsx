import { redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth";
import AvatarUploadForm from "./_components/AvatarUploadForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-base-content">
          Profile
        </h1>
        <p className="mt-0.5 text-sm text-base-content/50">
          Your account information and avatar.
        </p>
      </div>

      <AvatarUploadForm name={user.name} avatarFile={user.avatarFile} />

      <div className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body space-y-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-base-content/50">
              Name
            </div>
            <div className="text-sm text-base-content">{user.name}</div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-base-content/50">
              Email
            </div>
            <div className="text-sm text-base-content">{user.email}</div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-base-content/50">
              Member since
            </div>
            <div className="text-sm text-base-content">
              {user.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}