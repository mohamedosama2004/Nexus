"use client";

import { useRouter } from "next/navigation";

type NextpageButtonProps = {
  route: string;
  title: string;
};

export default function NextpageButton({
  route,
  title,
}: NextpageButtonProps) {
  const router = useRouter();
  function handleClick() {
    router.push(route);
  }
  return (
    <button className="btn" onClick={handleClick}>
      {title}
    </button>
  );
}
