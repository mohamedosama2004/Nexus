import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-1 text-xl font-bold tracking-tight text-base-content transition-opacity hover:opacity-80"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-black text-primary-content">
        N
      </div>
      exus
    </Link>
  );
}
