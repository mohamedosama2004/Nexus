import { Albums } from "../definitions";

export async function getAttachments() {
  const response = await fetch("https://jsonplaceholder.typicode.com/albums");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  const attachments: Albums[] = await response.json();
  return attachments;
}
