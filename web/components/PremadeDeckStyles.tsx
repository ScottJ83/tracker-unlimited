export default function PremadeDeckStyles() {
  return (
    <style>{`
      .premade-page-shell { display: grid; gap: 22px; }
      .premade-page-shell .sw-hero-block.compact { padding: 24px; }
      .premade-deck-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
      .premade-deck-tile { display: grid; gap: 12px; text-decoration: none; min-height: 210px; transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
      .premade-deck-tile:hover { transform: translateY(-3px); border-color: rgba(246, 241, 229, 0.34); box-shadow: 0 22px 60px rgba(0,0,0,0.34); }
      .premade-deck-tile h2 { margin: 0; color: var(--sw-cream); letter-spacing: 0.04em; text-transform: uppercase; font-size: 24px; }
      .premade-progress-row { display: flex; justify-content: space-between; gap: 12px; align-items: center; color: var(--sw-cream); font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
      .premade-progress-track { height: 10px; border-radius: 999px; overflow: hidden; background: rgba(246,241,229,0.10); border: 1px solid rgba(246,241,229,0.14); }
      .premade-progress-track span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--sw-gold), #f6f1e5); }
      .premade-tile-stats { display: flex; justify-content: space-between; gap: 12px; color: var(--sw-muted); font-size: 12px; }
      .premade-detail-hero { display: flex; justify-content: space-between; align-items: center; gap: 18px; flex-wrap: wrap; }
      .premade-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; }
      .premade-summary strong { display: block; margin-top: 6px; color: var(--sw-cream); font-size: 28px; letter-spacing: 0.04em; }
      .premade-progress-card { display: grid; gap: 10px; }
      .premade-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
      .premade-card-tile { display: grid; grid-template-columns: 88px 1fr; gap: 14px; min-height: 138px; transition: transform 160ms ease, opacity 160ms ease, filter 160ms ease, border-color 160ms ease; }
      .premade-card-tile:hover { transform: translateY(-2px); }
      .premade-card-tile.is-missing { opacity: 0.48; filter: grayscale(100%); }
      .premade-card-tile.is-missing:hover { opacity: 0.72; }
      .premade-card-tile.is-complete { border-color: rgba(215, 183, 101, 0.42); }
      .premade-card-image-wrap { width: 88px; height: 122px; border-radius: 10px; border: 1px solid rgba(246,241,229,0.16); background: rgba(0,0,0,0.34); overflow: hidden; display: flex; align-items: center; justify-content: center; }
      .premade-card-image-wrap img { width: 88px; height: 122px; object-fit: cover; display: block; }
      .premade-card-placeholder { color: var(--sw-dim); font-size: 28px; }
      .premade-card-copy { min-width: 0; display: grid; align-content: start; gap: 4px; }
      .premade-card-copy h3 { margin: 0; color: var(--sw-cream); font-size: 17px; line-height: 1.15; }
      .premade-owned-line { margin: 8px 0 0; color: var(--sw-cream); font-size: 12px; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
      .premade-missing-line { margin: 0; color: #fca5a5; font-size: 12px; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
      .premade-complete-line { margin: 0; color: var(--sw-gold); font-size: 12px; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
      @media (max-width: 640px) { .premade-card-tile { grid-template-columns: 76px 1fr; } .premade-card-image-wrap, .premade-card-image-wrap img { width: 76px; height: 106px; } }
    `}</style>
  );
}
