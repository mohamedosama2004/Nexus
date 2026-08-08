"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn btn-primary"
      type="submit"
    >
      {pending ? "Creating..." : "Create"}
    </button>
  );
}