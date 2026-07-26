import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-1 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-80"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-black text-gray-900">
        N
      </div>
      exus
    </Link>
  );
}
