import Link from "next/link";

function ArchiveCard({
  href,
  kicker,
  title,
  description,
  accent,
  disabled,
}: {
  href: string;
  kicker: string;
  title: string;
  description: string;
  accent: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className="sw-panel"
      style={{
        minHeight: "260px",
        padding: "28px",
        display: "grid",
        alignContent: "space-between",
        position: "relative",
        overflow: "hidden",
        borderColor: disabled ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.16)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 80% 18%, ${accent}, transparent 28%)`,
          opacity: disabled ? 0.18 : 0.34,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <div className="sw-kicker" style={{ marginBottom: "14px" }}>
          {kicker}
        </div>

        <h2
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "clamp(34px, 4vw, 58px)",
            lineHeight: 0.94,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textShadow: "0 0 24px rgba(255,255,255,0.18)",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "18px 0 0",
            color: "#d5d5d5",
            lineHeight: 1.65,
            maxWidth: "520px",
          }}
        >
          {description}
        </p>
      </div>

      <div
        className={disabled ? "sw-button" : "sw-button sw-button-primary"}
        style={{
          justifySelf: "start",
          marginTop: "28px",
          position: "relative",
          opacity: disabled ? 0.72 : 1,
        }}
      >
        {disabled ? "Framework Ready" : "Open Archive"}
      </div>
    </div>
  );

  if (disabled) {
    return <div>{content}</div>;
  }

  return (
    <Link href={href} style={{ display: "block" }}>
      {content}
    </Link>
  );
}

export default function TrackerUnlimitedHomePage() {
  return (
    <main>
      <section
        style={{
          minHeight: "calc(100vh - 190px)",
          display: "grid",
          alignContent: "center",
          gap: "34px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto" }}>
          <div className="sw-kicker">Universal Collection Archives</div>

          <h1
            className="sw-page-title"
            style={{
              marginTop: "14px",
              marginBottom: "14px",
            }}
          >
            Tracker Unlimited
          </h1>

          <p
            className="sw-page-subtitle"
            style={{
              maxWidth: "720px",
              margin: "0 auto",
            }}
          >
            Choose your archive. Track collections, monitor completion, manage wishlists,
            and build decks across supported trading card games.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "22px",
          }}
        >
          <ArchiveCard
            href="/swu"
            kicker="Active Archive"
            title="Star Wars Unlimited"
            description="Open the original Tracker Unlimited archive for Star Wars Unlimited cards, sets, collection tracking, decks, wishlist, uncollected cards, and analytics."
            accent="rgba(245,197,66,0.34)"
          />

          <ArchiveCard
            href="/pokemon"
            kicker="New Framework"
            title="Pokémon"
            description="Enter the Pokémon archive framework built for Pokédex browsing, regional organization, set tracking, collection management, wishlists, decks, and analytics."
            accent="rgba(45,212,191,0.32)"
          />
        </div>

        <div
          className="sw-panel"
          style={{
            padding: "18px",
            textAlign: "center",
            color: "#cfd7e4",
          }}
        >
          Future archives may include Magic, Lorcana, One Piece, Yu-Gi-Oh, and more.
        </div>
      </section>
    </main>
  );
}
