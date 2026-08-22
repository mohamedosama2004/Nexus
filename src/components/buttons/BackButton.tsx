"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  children?: ReactNode;
};

export default function BackButton({ children }: BackButtonProps) {
  const router = useRouter();
  function handleClick() {
    router.back();
  }
  return (
    <button className="btn" onClick={handleClick}>
      {children ? children : "Go back"}
    </button>
  );
}
