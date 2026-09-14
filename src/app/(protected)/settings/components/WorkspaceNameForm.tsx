"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

import {
  updateWorkspace,
  type SettingsActionState,
} from "@/src/actions/settings.actions";
import { SubmitButton } from "@/src/components/buttons/SubmitButton";

type WorkspaceNameFormProps = {
  workspaceName: string;
};

export function WorkspaceNameForm({ workspaceName }: WorkspaceNameFormProps) {
  const [state, formAction] = useActionState(updateWorkspace, {
    success: false,
    error: null,
  } satisfies SettingsActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Workspace name updated!");
    }
  }, [state]);

  // Keyed by the current name: a successful save revalidates the server, the
  // settings page re-renders with the new name, and this input remounts with
  // the fresh value (mirrors the avatar upload picker pattern).
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="workspace-name"
          className="block text-sm font-semibold text-base-content"
        >
          Workspace name
        </label>
        <input
          key={workspaceName}
          id="workspace-name"
          name="name"
          defaultValue={workspaceName}
          required
          maxLength={50}
          placeholder="My Workspace"
          className="input input-bordered mt-2 w-full sm:max-w-sm"
          aria-describedby={state.error ? "workspace-name-error" : undefined}
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      {state.error && (
        <p id="workspace-name-error" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <div>
        <SubmitButton label="Save changes" pendingLabel="Saving..." />
      </div>
    </form>
  );
}