import { redirect } from "next/navigation";

export default function Home() {
  redirect("/Ordersummary");
  return null;
}
