"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import {
  changePassword,
  type SettingsActionState,
} from "@/src/actions/settings.actions";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/src/schemas/settings.schema";
import { AuthInput } from "@/src/app/(auth)/_components/AuthInput";

const INITIAL_STATE: SettingsActionState = {
  success: false,
  error: null,
};

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await changePassword(INITIAL_STATE, formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Password updated successfully!");
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <AuthInput
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <AuthInput
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <AuthInput
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-sm h-10 rounded-lg px-4"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}