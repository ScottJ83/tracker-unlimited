"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function normalizeJoinedCard(item: any) {
  return Array.isArray(item?.cards) ? item.cards[0] : item?.cards;
}

function getAspectPills(aspect: string | null | undefined) {
  const text = String(aspect || "").toLowerCase();
  const pills: { name: string; color: string }[] = [];

  if (text.includes("vigilance")) pills.push({ name: "Vigilance", color: "#3b82f6" });
  if (text.includes("command")) pills.push({ name: "Command", color: "#16a34a" });
  if (text.includes("aggression")) pills.push({ name: "Aggression", color: "#dc2626" });
  if (text.includes("cunning")) pills.push({ name: "Cunning", color: "#d97706" });
  if (text.includes("heroism")) pills.push({ name: "Heroism", color: "#d4d4aa" });
  if (text.includes("villainy")) pills.push({ name: "Villainy", color: "#4c1d95" });

  return pills;
}

function CardImage({ src, name }: { src?: string | null; name: string }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "62px",
        minWidth: "62px",
        height: "86px",
        borderRadius: "7px",
        border: "1px solid rgba(255,255,255,0.18)",
        background: "#02040a",
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => src && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={name}
            style={{
              width: "62px",
              height: "86px",
              objectFit: "cover",
              borderRadius: "7px",
              display: "block",
            }}
          />
          {hover ? (
            <img
              src={src}
              alt={name}
              style={{
                position: "absolute",
                top: "-24px",
                left: "76px",
                width: "260px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 28px 75px rgba(0,0,0,0.72)",
                zIndex: 9999,
                background: "#02040a",
              }}
            />
          ) : null}
        </>
      ) : (
        <div style={{ fontSize: "10px", color: "#64748b", userSelect: "none" }}>—</div>
      )}
    </div>
  );
}

export default function WishlistClient({ data, userId }: { data: any[]; userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = (data || [])
      .map((item: any) => ({
        ...item,
        card: normalizeJoinedCard(item),
      }))
      .filter((item: any) => {
        const card = item.card;
        if (!card) return false;

        const haystack = [
          card.name,
          card.subtitle,
          card.set_code,
          card.card_number,
          card.variant,
          card.aspect,
          card.traits,
          card.rarity,
          card.card_type,
          card.arena,
        ]
          .map((value) => String(value || "").toLowerCase())
          .join(" ");

        return !q || haystack.includes(q);
      });

    result.sort((a: any, b: any) => {
      const ap = Number(a.card?.price || 0);
      const bp = Number(b.card?.price || 0);

      if (sortBy === "price_asc") return ap - bp;
      if (sortBy === "name_asc") return String(a.card?.name || "").localeCompare(String(b.card?.name || ""));
      if (sortBy === "name_desc") return String(b.card?.name || "").localeCompare(String(a.card?.name || ""));
      if (sortBy === "set_asc") return String(a.card?.set_code || "").localeCompare(String(b.card?.set_code || ""));
      return bp - ap;
    });

    return result;
  }, [data, search, sortBy]);

  const totalWantedValue = rows.reduce((sum: number, item: any) => sum + Number(item.card?.price || 0), 0);
  const highest = [...rows].sort((a: any, b: any) => Number(b.card?.price || 0) - Number(a.card?.price || 0))[0];
  const setCount = new Set(rows.map((item: any) => item.card?.set_code).filter(Boolean)).size;

  async function removeFromWishlist(wishlistId: string) {
    setRemovingId(wishlistId);

    const { error } = await supabase
      .from("wishlist_entries")
      .delete()
      .eq("id", wishlistId)
      .eq("user_id", userId);

    setRemovingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <section className="sw-wide-panel" style={{ padding: "18px", marginBottom: "18px" }}>
        <div className="sw-dashboard-grid">
          <div className="sw-stat-card">
            <div className="sw-muted" style={{ fontSize: 12 }}>Wanted Cards</div>
            <strong>{rows.length}</strong>
          </div>
          <div className="sw-stat-card">
            <div className="sw-muted" style={{ fontSize: 12 }}>Wanted Value</div>
            <strong>${totalWantedValue.toFixed(2)}</strong>
          </div>
          <div className="sw-stat-card">
            <div className="sw-muted" style={{ fontSize: 12 }}>Sets Represented</div>
            <strong>{setCount}</strong>
          </div>
          <div className="sw-stat-card">
            <div className="sw-muted" style={{ fontSize: 12 }}>Highest Wanted</div>
            <strong style={{ fontSize: "18px" }}>{highest?.card?.name || "-"}</strong>
            {highest ? (
              <div className="sw-muted" style={{ marginTop: 8, fontSize: 12 }}>
                {highest.card?.set_code} #{highest.card?.card_number} • ${Number(highest.card?.price || 0).toFixed(2)}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="sw-panel" style={{ marginBottom: "18px", padding: "14px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search wishlist"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: "320px", padding: "10px 12px" }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "10px 12px" }}
        >
          <option value="price_desc">Price High-Low</option>
          <option value="price_asc">Price Low-High</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
          <option value="set_asc">Set A-Z</option>
        </select>
      </section>

      {rows.length === 0 ? (
        <div className="sw-list-panel">No wanted cards yet. Use the Want button on the Missing Cards page.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(315px, 1fr))", gap: "14px", overflow: "visible" }}>
          {rows.map((item: any) => {
            const card = item.card;
            const aspectPills = getAspectPills(card?.aspect);

            return (
              <div
                key={item.id}
                className="sw-card-tile"
                style={{
                  padding: "12px",
                  minHeight: "170px",
                  display: "flex",
                  gap: "12px",
                  boxSizing: "border-box",
                  position: "relative",
                }}
              >
                <CardImage src={card?.front_art} name={card?.name || "Card"} />

                <div style={{ flex: 1, minWidth: 0, paddingBottom: "42px" }}>
                  <div className="sw-card-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {card?.name || "Unknown card"}
                  </div>
                  <div className="sw-card-meta" style={{ minHeight: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {card?.subtitle || ""}
                  </div>
                  <div className="sw-card-meta" style={{ marginTop: "6px" }}>
                    Set: {card?.set_code || "-"}<br />
                    #{card?.card_number ?? "-"} • {card?.variant || "-"}<br />
                    {card?.card_type || "-"}{card?.arena ? ` • ${card.arena}` : ""}
                  </div>

                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "7px" }}>
                    {aspectPills.map((pill) => (
                      <div
                        key={pill.name}
                        className="sw-badge"
                        style={{ color: pill.color, borderColor: pill.color }}
                      >
                        {pill.name}
                      </div>
                    ))}
                  </div>

                  <div className="sw-card-price" style={{ marginTop: "7px", fontSize: "12px" }}>
                    ${Number(card?.price || 0).toFixed(2)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.id)}
                  disabled={removingId === item.id}
                  className="sw-danger-button"
                  style={{
                    position: "absolute",
                    right: "10px",
                    bottom: "8px",
                    padding: "7px 10px",
                    cursor: removingId === item.id ? "not-allowed" : "pointer",
                    fontSize: "11px",
                  }}
                >
                  {removingId === item.id ? "Removing..." : "Remove"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
