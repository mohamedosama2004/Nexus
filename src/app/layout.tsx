import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/query-provider";
import { ThemeScript } from "../components/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus ",
  description: "Project management SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="corporate"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        <ThemeScript />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
