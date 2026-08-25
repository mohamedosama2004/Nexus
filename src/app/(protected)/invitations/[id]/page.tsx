import Link from "next/link";

import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

import { InvitationResponse } from "./_components/InvitationResponse";

type InvitationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  // 1. Authentication
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="flex justify-center">
        <div className="card w-full max-w-md bg-base-100 shadow-sm">
          <div className="card-body items-center text-center">
            <h1 className="card-title">Sign in required</h1>
            <p>You need to sign in to view this invitation.</p>
            <Link href="/login" className="btn btn-primary">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Get invitation ID
  const { id } = await params;

  // 3. Find invitation for the current user
  const invitation = await prisma.invitation.findFirst({
    where: {
      id,
      inviteeId: currentUser.id,
    },
    select: {
      id: true,
      status: true,
      role: true,
      projectRole: true,
      projectId: true,
      expiresAt: true,
      workspace: {
        select: {
          name: true,
        },
      },
      project: {
        select: {
          title: true,
        },
      },
      invitedBy: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!invitation) {
    return (
      <div className="flex justify-center">
        <div className="card w-full max-w-md bg-base-100 shadow-sm">
          <div className="card-body items-center text-center">
            <h1 className="card-title">Invitation not found</h1>
            <p>This invitation doesn&apos;t exist or wasn&apos;t sent to you.</p>
            <Link href="/dashboard" className="btn btn-primary">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isProjectInvitation = invitation.projectId !== null;
  const isExpired =
    invitation.status === "PENDING" && invitation.expiresAt < new Date();

  return (
    <div className="flex justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-sm">
        <div className="card-body items-center text-center">
          <h1 className="card-title">
            {isProjectInvitation ? "Project Invitation" : "Workspace Invitation"}
          </h1>

          {isProjectInvitation ? (
            <p>
              <span className="font-semibold">{invitation.invitedBy.name}</span>{" "}
              invited you to join the project{" "}
              <span className="font-semibold">
                &quot;{invitation.project?.title}&quot;
              </span>
              .
            </p>
          ) : (
            <p>
              <span className="font-semibold">{invitation.invitedBy.name}</span>{" "}
              invited you to join the workspace{" "}
              <span className="font-semibold">
                &quot;{invitation.workspace.name}&quot;
              </span>
              .
            </p>
          )}

          {(isProjectInvitation
            ? invitation.projectRole
            : invitation.role) && (
            <div className="badge badge-outline badge-primary">
              Role:{" "}
              {isProjectInvitation ? invitation.projectRole : invitation.role}
            </div>
          )}

          {invitation.status === "PENDING" && !isExpired && (
            <InvitationResponse invitationId={invitation.id} />
          )}

          {isExpired && (
            <div className="text-error">
              This invitation has expired.
            </div>
          )}

          {invitation.status === "ACCEPTED" && (
            <div className="text-success">You already accepted this invitation.</div>
          )}

          {invitation.status === "DECLINED" && (
            <div className="text-error">You declined this invitation.</div>
          )}

          {invitation.status === "EXPIRED" && (
            <div className="text-error">This invitation has expired.</div>
          )}

          {invitation.status === "CANCELLED" && (
            <div className="text-error">This invitation was cancelled.</div>
          )}

          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
