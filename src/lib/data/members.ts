import { User } from "../definitions"

export async function getUsers() {
    const response = await fetch(
    "https://jsonplaceholder.typicode.com/users"
  )

  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }

  const users: User[] = await response.json()
  return users
}