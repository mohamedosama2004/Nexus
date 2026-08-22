"use client";

import { useFormStatus } from "react-dom";

type Props = {
  label?: string;
  pendingLabel?: string;
};

export function SubmitButton({
  label = "Create",
  pendingLabel = "Creating...",
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn btn-primary"
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}