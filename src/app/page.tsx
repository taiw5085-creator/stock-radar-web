import { redirect } from "next/navigation";

/** 首頁導向飆股雷達主頁 */
export default function Home() {
  redirect("/stock-radar");
}
