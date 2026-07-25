import { redirect } from "next/navigation";

export const isLoggedin = false;
export default function ProfilePage() {
  if (!isLoggedin) {
    redirect("/login");
  }

  return <div>welcome to your profile</div>;
}
