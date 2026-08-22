"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  { label: "Profile", href: "/dashboard/profile" },
  { label: "Settings", href: "/settings" },
];

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close user menu" : "Open user menu"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        Menu
      </button>

      <div
        className={`absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-white/10 bg-gray-900 shadow-2xl transition-all duration-200 ease-out ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
        role="menu"
        aria-orientation="vertical"
        aria-label="User menu"
      >
        <div className="py-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center px-4 py-2.5 text-sm text-gray-300 transition-colors duration-150 hover:bg-white/5 hover:text-white"
              role="menuitem"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-white/10" />
          <button
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center px-4 py-2.5 text-sm text-red-400 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-300"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
