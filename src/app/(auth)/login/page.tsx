'use client'

import { useRouter } from "next/navigation"
import Link from "next/link"

const LoginPage = () => {
  const router = useRouter()

  const handleSubmit = () => {
    router.push("/dashboard")
  }

  return (
    <>
      <h2 className="card-title text-2xl font-bold justify-center mb-4">
        Welcome back
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="floating-label">
          <span>Email</span>
          <input
            type="email"
            placeholder="john@example.com"
            className="input input-bordered w-full"
          />
        </label>
        <label className="floating-label">
          <span>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full"
          />
        </label>
        <button type="submit" className="btn btn-primary w-full mt-2">
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
    </>
  )
}

export default LoginPage
