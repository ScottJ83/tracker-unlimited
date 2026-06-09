export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <main>
      <div className="sw-page-header">
        <div className="sw-kicker">Project Archives</div>
        <h1 className="sw-page-title">About</h1>
        <div className="sw-page-subtitle">
          The story and credits behind Tracker Unlimited.
        </div>
      </div>

      <section
        className="sw-panel"
        style={{
          padding: "28px",
          marginBottom: "22px",
          textAlign: "center",
        }}
      >
        <div className="sw-kicker" style={{ marginBottom: "18px" }}>
          Tracker Unlimited
        </div>

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
        <div className="sw-kicker" style={{ marginBottom: "12px" }}>
          Mission
        </div>

        <p
          style={{
            color: "#d5d5d5",
            lineHeight: 1.75,
            margin: 0,
            maxWidth: "900px",
          }}
        >
          Tracker Unlimited was created as a collection tracking, deck building,
          wishlist, and analytics platform for Star Wars Unlimited players. The
          project began as a personal collection tracker and grew into a full
          databank-style web application focused on organizing cards, monitoring
          set completion, managing uncollected cards, and helping players better
          understand their collections.
        </p>
      </section>

      <section className="sw-panel" style={{ padding: "24px" }}>
        <div className="sw-kicker" style={{ marginBottom: "12px" }}>
          Development Notes
        </div>

        <p
          style={{
            color: "#d5d5d5",
            lineHeight: 1.75,
            margin: 0,
            maxWidth: "900px",
          }}
        >
          Tracker Unlimited has been built through ongoing design, testing,
          feature planning, debugging, and visual refinement. Every major system
          was shaped around preserving user data, improving usability, and
          creating a cinematic databank-inspired experience for collectors and
          players.
        </p>
      </section>
    </main>
  );
}
