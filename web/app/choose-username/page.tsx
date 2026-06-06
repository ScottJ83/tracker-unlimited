export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsernameForm from "@/components/UsernameForm";

export default async function ChooseUsernamePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.username) {
    redirect("/");
  }

  return (
    <main style={{ padding: "24px" }}>
      <div
        style={{
          maxWidth: "460px",
          margin: "40px auto",
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "24px",
          background: "#111827",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>Choose a Username</h1>
        <p style={{ color: "#cbd5e1", lineHeight: 1.6, marginBottom: "18px" }}>
          You will still log in with your email, but your username will be shown around Tracker Unlimited instead of your email.
        </p>
        <UsernameForm userId={user.id} />
      </div>
    </main>
  );
}
