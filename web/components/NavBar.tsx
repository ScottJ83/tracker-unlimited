<header
  style={{
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    background: "#02060c",
    position: "sticky",
    top: 0,
    zIndex: 20,
  }}
>
  <div
    style={{
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "14px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Link
      href="/"
      style={{
        fontWeight: 900,
        letterSpacing: "0.12em",
        fontSize: "18px",
      }}
    >
      TRACKER UNLIMITED
    </Link>

    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <nav style={{ display: "flex", gap: "20px", color: "#cbd5e1" }}>
        <Link href="/">Home</Link>
        <Link href="/sets">Sets</Link>
        <Link href="/collection">Collection</Link>
        <Link href="/cards">Cards</Link>
        <Link href="/decks">Decks</Link>
      </nav>

      <AuthButton email={user?.email ?? null} />
    </div>
  </div>
</header>