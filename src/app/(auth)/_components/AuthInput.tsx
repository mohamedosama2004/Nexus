"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <label className="floating-label">
        <span>{label}</span>
        <div className="relative w-full">
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={`input input-bordered w-full ${isPassword ? "pr-10" : ""} ${error ? "input-error" : ""}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 transition-colors hover:text-base-content/70"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && <span className="label-text-alt text-error">{error}</span>}
      </label>
    );
  }
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
