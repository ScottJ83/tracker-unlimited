import Link from "next/link";

export default function NavBar() {
  return (
    <header
      style={{
        borderBottom: "1px solid #334155",
        background: "rgba(11, 17, 32, 0.88)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>
          TRACKER UNLIMITED
        </Link>

        <nav style={{ display: "flex", gap: "18px", color: "#cbd5e1" }}>
          <Link href="/">Home</Link>
          <Link href="/sets">Sets</Link>
          <Link href="/collection">Collection</Link>
        </nav>
      </div>
    </header>
  );
}