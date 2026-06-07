import { redirect } from "next/navigation";

export default function MissingRedirectPage() {
  redirect("/uncollected");
}
