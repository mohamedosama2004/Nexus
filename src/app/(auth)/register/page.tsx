"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/src/schemas/auth.schema";
import { AuthInput } from "@/src/components/AuthInput";
import { register } from "@/src/actions/auth.actions";

const RegisterPage = () => {
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await register(formData);

    if (result.error) {
      return;
    }

    router.push("/dashboard");
  };

  return (
    <>
      <h2 className="card-title text-2xl font-bold justify-center mb-4">
        Create an account
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <AuthInput
          label="Name"
          type="text"
          placeholder="John Doe"
          error={errors.name?.message}
          {...registerField("name")}
        />
        <AuthInput
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...registerField("email")}
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...registerField("password")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full mt-2"
        >
          Register
        </button>
      </form>
      <div className="divider">OR</div>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="link link-primary">
          Sign in
        </Link>
      </p>
    </>
  );
};

export default RegisterPage;
