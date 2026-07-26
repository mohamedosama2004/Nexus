"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  function handleClick() {
    router.back();
  }
  return (
    <button className="btn" onClick={handleClick}>
      Go back
    </button>
  );
}
