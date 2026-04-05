import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AuthButton from "./AuthButton";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          <div className="brand-mark">SWU</div>

          <div className="brand-text">
            <div className="brand-title">Tracker Unlimited</div>
            <div className="brand-subtitle">Star Wars Unlimited Collection App</div>
          </div>
        </Link>

        <div className="topbar-right">
          <nav className="nav-pills">
            <Link href="/" className="nav-pill">
              Home
            </Link>
            <Link href="/sets" className="nav-pill">
              Sets
            </Link>
            <Link href="/collection" className="nav-pill">
              Collection
            </Link>
            <Link href="/cards" className="nav-pill">
              Cards
            </Link>
          </nav>

          <AuthButton email={user?.email ?? null} />
        </div>
      </div>
    </header>
  );
}