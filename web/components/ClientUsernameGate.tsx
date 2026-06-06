"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const EXEMPT_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/update-password",
  "/choose-username",
];

function isExemptPath(pathname: string) {
  return EXEMPT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function ClientUsernameGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkUsername() {
      if (isExemptPath(pathname)) {
        if (!cancelled) setChecking(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled && !profile?.username) {
        router.replace("/choose-username");
        return;
      }

      if (!cancelled) setChecking(false);
    }

    checkUsername();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, supabase]);

  if (checking && !isExemptPath(pathname)) {
    return (
      <main style={{ padding: "24px" }}>
        <div
          style={{
            maxWidth: "420px",
            margin: "40px auto",
            border: "1px solid #334155",
            borderRadius: "18px",
            padding: "24px",
            background: "#111827",
            color: "#e5edf7",
          }}
        >
          Loading account...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
