export const dynamic = "force-dynamic";

const timelineItems = [
  {
    label: "Initial Concept",
    title: "Collection Tracking Foundation",
    text:
      "Tracker Unlimited began as a personal Star Wars Unlimited collection tracker focused on importing card data, recording owned cards, and viewing set progress.",
  },
  {
    label: "Data Expansion",
    title: "Cards, Sets, Variants, and Prices",
    text:
      "The database expanded to support card variants, organized play sets, new set imports, price refreshes, and safer update workflows that preserve user collection data.",
  },
  {
    label: "Collection Tools",
    title: "Set Completion and Uncollected Cards",
    text:
      "Set pages, collection pages, completion counts, uncollected card tracking, spoiler-safe views, and wishlist tools were added to make the tracker useful for collectors.",
  },
  {
    label: "Deck Building",
    title: "Deck Management System",
    text:
      "Deck creation tools were added for leaders, bases, main deck cards, filtering, validation, card counts, and visual deck summaries.",
  },
  {
    label: "User Features",
    title: "Accounts, Profiles, and Wishlist",
    text:
      "Tracker Unlimited gained usernames, profile photos, wishlist management, login improvements, and account-focused profile pages while keeping user data intact.",
  },
  {
    label: "Analytics",
    title: "Collection Insights",
    text:
      "Analytics were added to summarize collection value, owned cards, valuable sets, aspects, rarity breakdowns, and overall progress across the card database.",
  },
  {
    label: "Visual Identity",
    title: "Databank Theme",
    text:
      "The site evolved into a cinematic databank-inspired interface with custom navigation, card tiles, hover previews, dark blue space styling, gold highlights, and a custom favicon.",
  },
  {
    label: "Version 1.0",
    title: "Public Tracker Unlimited",
    text:
      "The project reached its first polished public version with collection tracking, decks, wishlist, uncollected cards, analytics, profiles, custom branding, and an About archive.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <div className="sw-page-header">
        <div className="sw-kicker">Project Archives</div>
        <h1 className="sw-page-title">About</h1>
        <div className="sw-page-subtitle">The story and credits behind Tracker Unlimited.</div>
      </div>

      <section className="sw-panel" style={{ padding: "28px", marginBottom: "22px", textAlign: "center" }}>
        <div className="sw-kicker" style={{ marginBottom: "18px" }}>Tracker Unlimited</div>
        <h2
          style={{
            margin: "0 0 22px",
            fontSize: "clamp(34px, 5vw, 64px)",
            lineHeight: 0.92,
            color: "#fff",
            textShadow: "0 0 24px rgba(255,255,255,0.18)",
          }}
        >
          TRACKER<br />UNLIMITED
        </h2>

        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            display: "grid",
            gap: "10px",
            color: "#d5d5d5",
            fontSize: "15px",
            lineHeight: 1.65,
          }}
        >
          <div>Created by Jackson Scott</div>
          <div>Developed with ChatGPT (&quot;Nova&quot;)</div>
          <div>Version 1.0</div>
        </div>
      </section>

      <section className="sw-panel" style={{ padding: "24px", marginBottom: "22px" }}>
        <div className="sw-kicker" style={{ marginBottom: "12px" }}>The Goal</div>
        <p style={{ color: "#d5d5d5", lineHeight: 1.75, margin: 0, maxWidth: "950px" }}>
          Tracker Unlimited was created as a collection tracking and deck building platform for Star Wars Unlimited
          players and has grown into a web application focused on organizing cards, monitoring set completion,
          managing uncollected cards, and helping players better understand their collections.
        </p>
      </section>

      <section className="sw-panel" style={{ padding: "24px" }}>
        <div className="sw-kicker" style={{ marginBottom: "18px" }}>Development Timeline</div>

        <div className="tu-about-timeline" aria-label="Tracker Unlimited development timeline">
          {timelineItems.map((item, index) => (
            <div className="tu-about-timeline-item" key={item.title}>
              <div className="tu-about-timeline-marker">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="tu-about-timeline-card">
                <div className="tu-about-timeline-label">{item.label}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
