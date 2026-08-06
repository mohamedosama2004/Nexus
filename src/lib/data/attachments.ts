import { Albums } from "../definitions";

const attachments: Albums[] = [
  { userId: 1, id: 1, title: "Brand kit" },
  { userId: 1, id: 2, title: "Sprint notes" },
  { userId: 2, id: 3, title: "Release checklist" },
  { userId: 2, id: 4, title: "Onboarding assets" },
  { userId: 3, id: 5, title: "Design references" },
  { userId: 3, id: 6, title: "Planning deck" },
  { userId: 4, id: 7, title: "Stakeholder brief" },
  { userId: 5, id: 8, title: "Archive bundle" },
];

export async function getAttachments() {
  return attachments;
}
