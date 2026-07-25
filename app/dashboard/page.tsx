import Link from "next/link";
import BackButton from "../components/BackButton";
import { isLoggedin } from "./profile/page";
export default function DashboardPage() {
  
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard.</p>
      <BackButton/>
      {
      !isLoggedin ?(<Link className="btn" href="/login">Login</Link>) :(<Link href='/dashboard/profile' className="btn">go to profile</Link>)
      }
    </main>
  );
}
