"use client";

import { useMemo, useState } from "react";
import AddCardButton from "./AddCardButton";

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

function StatPill({ label, value, color }: { label: string; value: any; color: string }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div
      style={{
        fontSize: "10px",
        lineHeight: 1,
        padding: "3px 6px",
        borderRadius: "999px",
        background: `${color}22`,
        border: `1px solid ${color}`,
        color,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {label}: {value}
    </div>
  );
}

function CardImage({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
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
              cursor: "pointer",
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
        <div
          style={{
            fontSize: "10px",
            color: "#475569",
            userSelect: "none",
          }}
        >
          —
        </div>
      )}
    </div>
  );
}

export default function CollectionClient({ data }: any) {
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();

    let rows = (data || []).filter((item: any) => {
      const card = Array.isArray(item.cards) ? item.cards[0] : item.cards;

      const name = String(card?.name || "").toLowerCase();
      const subtitle = String(card?.subtitle || "").toLowerCase();
      const setCode = String(card?.set_code || "").toLowerCase();
      const number = String(card?.card_number || "").toLowerCase();
      const aspect = String(card?.aspect || "").toLowerCase();
      const traits = String(card?.traits || "").toLowerCase();

      const frontText = String(card?.front_text || "").toLowerCase();
      const rarity = String(card?.rarity || "").toLowerCase();
      const artist = String(card?.artist || "").toLowerCase();
      const cost = String(card?.cost ?? "").toLowerCase();
      const power = String(card?.power ?? "").toLowerCase();
      const hp = String(card?.hp ?? "").toLowerCase();

      const mainMatch =
        !q ||
        name.includes(q) ||
        subtitle.includes(q) ||
        setCode.includes(q) ||
        number.includes(q) ||
        aspect.includes(q) ||
        traits.includes(q);

      const textMatch =
        !tq ||
        frontText.includes(tq) ||
        rarity.includes(tq) ||
        artist.includes(tq) ||
        cost.includes(tq) ||
        power.includes(tq) ||
        hp.includes(tq);

      return mainMatch && textMatch;
    });

    rows.sort((a: any, b: any) => {
      const ac = Array.isArray(a.cards) ? a.cards[0] : a.cards;
      const bc = Array.isArray(b.cards) ? b.cards[0] : b.cards;

      const ap = Number(ac?.price || 0) * Number(a.quantity || 0);
      const bp = Number(bc?.price || 0) * Number(b.quantity || 0);

      if (sortBy === "price_asc") return ap - bp;
      if (sortBy === "name_asc") return String(ac?.name || "").localeCompare(String(bc?.name || ""));
      if (sortBy === "name_desc") return String(bc?.name || "").localeCompare(String(ac?.name || ""));
      return bp - ap;
    });

    return rows;
  }, [data, search, textSearch, sortBy]);

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search name, set, number, aspect, or traits"
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

        <input
          type="text"
          placeholder="Search text, rarity, artist, cost, power, or hp"
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
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
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "14px",
        }}
      >
        {filtered.map((item: any) => {
          const card = Array.isArray(item.cards) ? item.cards[0] : item.cards;
          const aspectPills = getAspectPills(card?.aspect);
          const unitValue = Number(card?.price || 0);
          const totalValue = unitValue * Number(item.quantity || 0);

          return (
            <div
              key={item.id}
              style={{
                border: "1px solid #22c55e",
                borderRadius: "14px",
                padding: "10px",
                height: "155px",
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

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  paddingBottom: "40px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: "#e5edf7",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {card?.name || "Unknown card"}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          minHeight: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {card?.subtitle || ""}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "4px",
                        flexShrink: 0,
                        maxWidth: "120px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <StatPill label="Cost" value={card?.cost} color="#eab308" />
                        <StatPill label="Power" value={card?.power} color="#dc2626" />
                        <StatPill label="HP" value={card?.hp} color="#2563eb" />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
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
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      marginTop: "5px",
                      color: "#cbd5e1",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Set: {card?.set_code || "-"}
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#cbd5e1",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    #{card?.card_number ?? "-"} • {card?.variant || "-"}
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#cbd5e1",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Traits: {card?.traits || "-"}
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      lineHeight: 1.25,
                      color: "#cbd5e1",
                      marginTop: "5px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      maxHeight: "26px",
                    }}
                  >
                    {card?.front_text || "-"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "5px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ color: "#86efac", fontWeight: 700 }}>
                      Qty: {item.quantity}
                    </div>
                    <div style={{ color: "#cbd5e1" }}>
                      Unit: ${unitValue.toFixed(2)}
                    </div>
                    <div style={{ color: "#e5edf7", fontWeight: 700 }}>
                      Total: ${totalValue.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  right: "10px",
                  bottom: "8px",
                }}
              >
                <AddCardButton cardId={item.card_id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}