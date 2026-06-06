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
        width: "56px",
        minWidth: "56px",
        height: "78px",
        borderRadius: "8px",
        border: "1px solid #334155",
        background: "#0b1220",
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => {
        if (src) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={name}
            style={{
              width: "56px",
              height: "78px",
              objectFit: "cover",
              borderRadius: "8px",
              display: "block",
            }}
          />
          {hover ? (
            <img
              src={src}
              alt={name}
              style={{
                position: "absolute",
                top: "-18px",
                left: "66px",
                width: "220px",
                borderRadius: "12px",
                border: "1px solid #334155",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                zIndex: 999,
                background: "#02040a",
              }}
            />
          ) : null}
        </>
      ) : (
        <div style={{ fontSize: "10px", color: "#475569", userSelect: "none" }}>—</div>
      )}
    </div>
  );
}

export default function WishlistClient({ data, userId }: { data: any[]; userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");
  const [setFilter, setSetFilter] = useState("all");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const normalized = useMemo(() => {
    return (data || [])
      .map((item: any) => ({
        ...item,
        card: normalizeJoinedCard(item),
      }))
      .filter((item: any) => item.card);
  }, [data]);

  const setOptions = useMemo(() => {
    return Array.from(new Set(normalized.map((item: any) => item.card?.set_code)))
      .filter(Boolean)
      .sort();
  }, [normalized]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = normalized.filter((item: any) => {
      const card = item.card;

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

      const searchMatches = !q || haystack.includes(q);
      const setMatches = setFilter === "all" || card?.set_code === setFilter;

      return searchMatches && setMatches;
    });

    result.sort((a: any, b: any) => {
      const ap = Number(a.card?.price || 0);
      const bp = Number(b.card?.price || 0);

      if (sortBy === "price_asc") return ap - bp;
      if (sortBy === "name_asc") return String(a.card?.name || "").localeCompare(String(b.card?.name || ""));
      if (sortBy === "name_desc") return String(b.card?.name || "").localeCompare(String(a.card?.name || ""));
      if (sortBy === "set_asc") {
        const setCompare = String(a.card?.set_code || "").localeCompare(String(b.card?.set_code || ""));
        if (setCompare !== 0) return setCompare;
        return Number(a.card?.card_number || 0) - Number(b.card?.card_number || 0);
      }
      return bp - ap;
    });

    return result;
  }, [normalized, search, sortBy, setFilter]);

  const totalWantedValue = rows.reduce((sum: number, item: any) => sum + Number(item.card?.price || 0), 0);
  const totalWishlistValue = normalized.reduce((sum: number, item: any) => sum + Number(item.card?.price || 0), 0);
  const highest = [...rows].sort((a: any, b: any) => Number(b.card?.price || 0) - Number(a.card?.price || 0))[0];
  const averageVisibleValue = rows.length ? totalWantedValue / rows.length : 0;

  const setSummary = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    for (const item of rows) {
      const setCode = item.card?.set_code || "Unknown";
      const existing = map.get(setCode) || { count: 0, value: 0 };
      existing.count += 1;
      existing.value += Number(item.card?.price || 0);
      map.set(setCode, existing);
    }

    return Array.from(map.entries())
      .map(([setCode, stats]) => ({ setCode, ...stats }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [rows]);

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
      <section
        style={{
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "18px",
          background: "linear-gradient(180deg, #172033, #111827)",
          marginBottom: "18px",
          display: "grid",
          gap: "8px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "18px" }}>Wishlist Summary</div>
        <div style={{ color: "#cbd5e1" }}>Visible Wanted Cards: {rows.length}</div>
        <div style={{ color: "#cbd5e1" }}>Visible Wanted Value: ${totalWantedValue.toFixed(2)}</div>
        <div style={{ color: "#cbd5e1" }}>Total Wishlist Value: ${totalWishlistValue.toFixed(2)}</div>
        <div style={{ color: "#cbd5e1" }}>Average Visible Wanted Value: ${averageVisibleValue.toFixed(2)}</div>
        {highest ? (
          <div style={{ color: "#cbd5e1" }}>
            Highest Visible Wanted: {highest.card?.name} ({highest.card?.variant}) — ${Number(highest.card?.price || 0).toFixed(2)}
          </div>
        ) : null}

        {setSummary.length > 0 ? (
          <div style={{ marginTop: "8px" }}>
            <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Top Wanted Sets</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {setSummary.map((item) => (
                <div
                  key={item.setCode}
                  style={{
                    border: "1px solid #334155",
                    background: "#0f172a",
                    borderRadius: "999px",
                    padding: "6px 9px",
                    color: "#cbd5e1",
                    fontSize: "12px",
                  }}
                >
                  {item.setCode}: {item.count} / ${item.value.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search wishlist"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            minWidth: "320px",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        />

        <select
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        >
          <option value="all">All Sets</option>
          {setOptions.map((setCode) => (
            <option key={setCode} value={setCode}>
              {setCode}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        >
          <option value="price_desc">Price High-Low</option>
          <option value="price_asc">Price Low-High</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
          <option value="set_asc">Set / Number</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div
          style={{
            border: "1px solid #334155",
            borderRadius: "18px",
            padding: "24px",
            background: "linear-gradient(180deg, #172033, #111827)",
            color: "#cbd5e1",
          }}
        >
          No wanted cards match the current filters.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "14px",
          }}
        >
          {rows.map((item: any) => {
            const card = item.card;
            const aspectPills = getAspectPills(card?.aspect);

            return (
              <div
                key={item.id}
                style={{
                  border: "1px solid #334155",
                  borderRadius: "14px",
                  padding: "10px",
                  minHeight: "170px",
                  background: "#0f172a",
                  display: "flex",
                  gap: "10px",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  position: "relative",
                }}
              >
                <div style={{ width: "56px", minWidth: "56px" }}>
                  <CardImage src={card?.front_art} name={card?.name || "Card"} />
                </div>

                <div style={{ flex: 1, minWidth: 0, paddingBottom: "42px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#e5edf7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {card?.name || "Unknown card"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", minHeight: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {card?.subtitle || ""}
                  </div>
                  <div style={{ fontSize: "11px", marginTop: "5px", color: "#cbd5e1" }}>
                    {card?.set_code || "-"} #{card?.card_number ?? "-"} • {card?.variant || "-"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                    {card?.card_type || "-"}{card?.arena ? ` • ${card.arena}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                    {aspectPills.map((pill) => (
                      <div
                        key={pill.name}
                        style={{
                          fontSize: "9px",
                          lineHeight: 1,
                          padding: "3px 5px",
                          borderRadius: "999px",
                          background: `${pill.color}22`,
                          border: `1px solid ${pill.color}`,
                          color: pill.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pill.name}
                      </div>
                    ))}
                  </div>
                  <div style={{ color: "#e5edf7", fontWeight: 700, marginTop: "6px", fontSize: "12px" }}>
                    ${Number(card?.price || 0).toFixed(2)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.id)}
                  disabled={removingId === item.id}
                  style={{
                    position: "absolute",
                    right: "10px",
                    bottom: "8px",
                    padding: "7px 9px",
                    borderRadius: "9px",
                    border: "1px solid #7f1d1d",
                    background: "#2a0f14",
                    color: "#fecaca",
                    cursor: removingId === item.id ? "not-allowed" : "pointer",
                    fontSize: "11px",
                    fontWeight: 700,
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
