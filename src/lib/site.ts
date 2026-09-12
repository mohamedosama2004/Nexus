export const siteConfig = {
  name: "Nexus",
  description:
    "Nexus is a project management platform to plan, track, and ship your team's work.",
  url: process.env.APP_URL ?? "http://localhost:3000",
} as const;