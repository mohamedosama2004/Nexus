"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/src/schemas/auth.schema";
import { AuthInput } from "@/src/components/AuthInput";
import { login } from "@/src/actions/auth.actions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await login(formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Login successful!");
    router.push("/dashboard");
  };

  return (
    <>
      <h2 className="card-title text-2xl font-bold justify-center mb-4">
        Welcome back
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <AuthInput
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full mt-2"
        >
          Sign in
        </button>
      </form>
      <div className="divider">OR</div>
      <p className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="link link-primary">
          Create one
        </Link>
      </p>
      <ToastContainer position="top-right" />
    </>
  );
};

export default LoginPage;
