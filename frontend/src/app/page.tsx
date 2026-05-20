import { redirect } from "next/navigation";

export default function HomePage() {
  // Automatically redirect anyone visiting the root URL to the login page
  redirect("/login");
}
