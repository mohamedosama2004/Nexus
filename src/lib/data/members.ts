import { User } from "../definitions";

const users: User[] = [
  { id: 1, name: "Alex Morgan", email: "alex.morgan@example.com" },
  { id: 2, name: "Jordan Lee", email: "jordan.lee@example.com" },
  { id: 3, name: "Taylor Brooks", email: "taylor.brooks@example.com" },
  { id: 4, name: "Casey Patel", email: "casey.patel@example.com" },
  { id: 5, name: "Riley Chen", email: "riley.chen@example.com" },
];

export async function getUsers() {
  return users;
}
