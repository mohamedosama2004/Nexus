import { InputHTMLAttributes, forwardRef } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type, ...props }, ref) => {
    return (
      <label className="floating-label">
        <span>{label}</span>
        <input
          ref={ref}
          type={type}
          className={`input input-bordered w-full ${error ? "input-error" : ""}`}
          {...props}
        />
        {error && <span className="label-text-alt text-error">{error}</span>}
      </label>
    );
  }
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
