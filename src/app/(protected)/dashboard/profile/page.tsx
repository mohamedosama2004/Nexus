import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth";
import AvatarUploadForm from "./_components/AvatarUploadForm";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Nexus profile photo and account information.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-base-content/50">
          Manage your profile photo and account information.
        </p>
      </div>

      <AvatarUploadForm name={user.name} avatarFile={user.avatarFile} />

      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body gap-0 p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-base-content">
            Account information
          </h2>
          <p className="mt-0.5 text-sm text-base-content/50">
            Details associated with your account.
          </p>

          <dl className="mt-4 divide-y divide-base-200">
            <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm font-medium text-base-content/50">Name</dt>
              <dd className="text-sm font-medium text-base-content sm:text-right">
                {user.name}
              </dd>
            </div>

            <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm font-medium text-base-content/50">
                Email
              </dt>
              <dd className="break-all text-sm text-base-content sm:text-right">
                {user.email}
              </dd>
            </div>

            <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm font-medium text-base-content/50">
                Member since
              </dt>
              <dd className="text-sm text-base-content sm:text-right">
                {user.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}