"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: any;
  color: string;
}) {
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

function MiniActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 8px",
        borderRadius: "8px",
        border: "1px solid #475569",
        background: disabled ? "#0f172a" : "#1e293b",
        color: disabled ? "#64748b" : "#e5edf7",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "11px",
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

function getCardTypeLabel(card: any) {
  return String(card?.card_type || card?.type || "").trim();
}

function getArenaLabel(card: any) {
  return String(card?.arena || "").trim();
}

function isLeader(card: any) {
  return getCardTypeLabel(card).toLowerCase().includes("leader");
}

function isBase(card: any) {
  return getCardTypeLabel(card).toLowerCase().includes("base");
}

function isEvent(card: any) {
  return getCardTypeLabel(card).toLowerCase().includes("event");
}

function isUpgrade(card: any) {
  return getCardTypeLabel(card).toLowerCase().includes("upgrade");
}

function isUnit(card: any) {
  const type = getCardTypeLabel(card).toLowerCase();
  return type.includes("unit");
}

function isSpaceUnit(card: any) {
  return isUnit(card) && getArenaLabel(card).toLowerCase().includes("space");
}

function isGroundUnit(card: any) {
  return isUnit(card) && getArenaLabel(card).toLowerCase().includes("ground");
}

function normalizeJoinedCard(item: any) {
  return Array.isArray(item?.cards) ? item.cards[0] : item?.cards;
}

function DeckCardTile({
  card,
  quantity,
  onAdd,
  onRemove,
}: {
  card: any;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const aspectPills = getAspectPills(card?.aspect);

  return (
    <div
      style={{
        border: "1px solid #22c55e",
        borderRadius: "14px",
        padding: "10px",
        minHeight: "155px",
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
          paddingBottom: "46px",
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
            Type: {getCardTypeLabel(card) || "-"}{getArenaLabel(card) ? ` • ${getArenaLabel(card)}` : ""}
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
    In Deck: {quantity}
  </div>
  <div style={{ color: "#cbd5e1" }}>
    Unit: ${Number(card?.price || 0).toFixed(2)}
  </div>
</div>
  <div style={{ color: "#cbd5e1" }}>
    Unit: ${Number(card?.price || 0).toFixed(2)}
  </div>
</div>          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: "10px",
          bottom: "8px",
          display: "flex",
          gap: "8px",
        }}
      >
        <MiniActionButton onClick={onRemove}>-</MiniActionButton>
        <MiniActionButton onClick={onAdd}>+</MiniActionButton>
      </div>
    </div>
  );
}

function CollectionCardTile({
  card,
  ownedQty,
  availableQty,
  leaderSelected,
  baseSelected,
  onSetLeader,
  onSetBase,
  onAddToDeck,
}: {
  card: any;
  ownedQty: number;
  availableQty: number;
  leaderSelected: boolean;
  baseSelected: boolean;
  onSetLeader: () => void;
  onSetBase: () => void;
  onAddToDeck: () => void;
}) {
  const aspectPills = getAspectPills(card?.aspect);
  const leaderEligible = isLeader(card);
  const baseEligible = isBase(card);

  return (
    <div
      style={{
        border: "1px solid #22c55e",
        borderRadius: "14px",
        padding: "10px",
        minHeight: "188px",
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
          paddingBottom: "72px",
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
            Type: {getCardTypeLabel(card) || "-"}
            {getArenaLabel(card) ? ` • ${getArenaLabel(card)}` : ""}
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
              Owned: {ownedQty}
            </div>
            <div style={{ color: "#e5edf7", fontWeight: 700 }}>
              Available: {availableQty}
            </div>
            <div style={{ color: "#cbd5e1" }}>
              Unit: ${Number(card?.price || 0).toFixed(2)}
            </div>
            {leaderSelected ? (
              <div style={{ color: "#7dd3fc", fontWeight: 700 }}>Leader</div>
            ) : null}
            {baseSelected ? (
              <div style={{ color: "#fca5a5", fontWeight: 700 }}>Base</div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: "10px",
          bottom: "8px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: "6px",
          maxWidth: "210px",
        }}
      >
        {leaderEligible ? (
          <MiniActionButton
            onClick={onSetLeader}
            disabled={availableQty <= 0 && !leaderSelected}
          >
            {leaderSelected ? "Leader ✓" : "Set Leader"}
          </MiniActionButton>
        ) : null}

        {baseEligible ? (
          <MiniActionButton
            onClick={onSetBase}
            disabled={availableQty <= 0 && !baseSelected}
          >
            {baseSelected ? "Base ✓" : "Set Base"}
          </MiniActionButton>
        ) : null}

        {!leaderEligible && !baseEligible ? (
          <MiniActionButton onClick={onAddToDeck} disabled={availableQty <= 0}>
            Add to Deck
          </MiniActionButton>
        ) : null}
      </div>
    </div>
  );
}
  deck,
  collectionEntries,
  initialDeckCards,
}: {
  deck: any;
  collectionEntries: any[];
  initialDeckCards: any[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [deckName, setDeckName] = useState(String(deck?.name || "New Deck"));
  const [leaderCardId, setLeaderCardId] = useState<string | null>(deck?.leader_card_id || null);
  const [baseCardId, setBaseCardId] = useState<string | null>(deck?.base_card_id || null);
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [arenaFilter, setArenaFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [deckCards, setDeckCards] = useState<{ card_id: string; quantity: number }[]>(
    (initialDeckCards || []).map((item: any) => ({
      card_id: item.card_id,
      quantity: Number(item.quantity || 0),
    }))
  );

  const collectionRows = useMemo(() => {
    return (collectionEntries || [])
      .map((item: any) => {
        const card = normalizeJoinedCard(item);
        return {
          ...item,
          card,
          quantity: Number(item.quantity || 0),
        };
      })
      .filter((item: any) => item.card && item.quantity > 0);
  }, [collectionEntries]);

  const collectionMap = useMemo(() => {
    const map = new Map<string, { quantity: number; card: any }>();

    for (const item of collectionRows) {
      map.set(item.card_id, {
        quantity: Number(item.quantity || 0),
        card: item.card,
      });
    }

    return map;
  }, [collectionRows]);

  function getMainDeckQty(cardId: string) {
    return deckCards.find((item) => item.card_id === cardId)?.quantity || 0;
  }

  function getUsedCount(cardId: string) {
    return (
      getMainDeckQty(cardId) +
      (leaderCardId === cardId ? 1 : 0) +
      (baseCardId === cardId ? 1 : 0)
    );
  }

  function getOwnedCount(cardId: string) {
    return Number(collectionMap.get(cardId)?.quantity || 0);
  }

  function getAvailableCount(cardId: string) {
    return getOwnedCount(cardId) - getUsedCount(cardId);
  }

  function addMainDeckCard(cardId: string) {
    if (getAvailableCount(cardId) <= 0) return;

    setDeckCards((prev) => {
      const existing = prev.find((item) => item.card_id === cardId);
      if (existing) {
        return prev.map((item) =>
          item.card_id === cardId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { card_id: cardId, quantity: 1 }];
    });
  }

  function removeMainDeckCard(cardId: string) {
    setDeckCards((prev) => {
      const existing = prev.find((item) => item.card_id === cardId);
      if (!existing) return prev;

      if (existing.quantity <= 1) {
        return prev.filter((item) => item.card_id !== cardId);
      }

      return prev.map((item) =>
        item.card_id === cardId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  }

  function chooseLeader(cardId: string) {
    if (leaderCardId === cardId) {
      setLeaderCardId(null);
      return;
    }

    if (getAvailableCount(cardId) <= 0) return;
    setLeaderCardId(cardId);
  }

  function chooseBase(cardId: string) {
    if (baseCardId === cardId) {
      setBaseCardId(null);
      return;
    }

    if (getAvailableCount(cardId) <= 0) return;
    setBaseCardId(cardId);
  }

  const filteredCollection = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();

    return collectionRows.filter((item: any) => {
      const card = item.card;

      const name = String(card?.name || "").toLowerCase();
      const subtitle = String(card?.subtitle || "").toLowerCase();
      const setCode = String(card?.set_code || "").toLowerCase();
      const number = String(card?.card_number || "").toLowerCase();
      const aspect = String(card?.aspect || "").toLowerCase();
      const traits = String(card?.traits || "").toLowerCase();
      const type = getCardTypeLabel(card).toLowerCase();
      const arena = getArenaLabel(card).toLowerCase();

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
        traits.includes(q) ||
        type.includes(q) ||
        arena.includes(q);

      const textMatch =
        !tq ||
        frontText.includes(tq) ||
        rarity.includes(tq) ||
        artist.includes(tq) ||
        cost.includes(tq) ||
        power.includes(tq) ||
        hp.includes(tq);

      const typeMatches =
        typeFilter === "all" ||
        (typeFilter === "leader" && isLeader(card)) ||
        (typeFilter === "base" && isBase(card)) ||
        (typeFilter === "unit" && isUnit(card)) ||
        (typeFilter === "event" && isEvent(card)) ||
        (typeFilter === "upgrade" && isUpgrade(card));

      const arenaMatches =
        arenaFilter === "all" ||
        (arenaFilter === "space" && isSpaceUnit(card)) ||
        (arenaFilter === "ground" && isGroundUnit(card));

      return mainMatch && textMatch && typeMatches && arenaMatches;
    });
  }, [collectionRows, search, textSearch, typeFilter, arenaFilter]);

  const mainDeckDetailed = useMemo(() => {
    return deckCards
      .map((item) => {
        const matched = collectionMap.get(item.card_id);
        return matched
          ? {
              card_id: item.card_id,
              quantity: item.quantity,
              card: matched.card,
            }
          : null;
      })
      .filter(Boolean) as any[];
  }, [deckCards, collectionMap]);

  const leaderCard = leaderCardId ? collectionMap.get(leaderCardId)?.card : null;
  const baseCard = baseCardId ? collectionMap.get(baseCardId)?.card : null;

  const mainDeckCount = mainDeckDetailed.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const summary = useMemo(() => {
    let spaceUnits = 0;
    let groundUnits = 0;
    let events = 0;
    let upgrades = 0;

    for (const item of mainDeckDetailed) {
      const qty = Number(item.quantity || 0);
      const card = item.card;

      if (isSpaceUnit(card)) spaceUnits += qty;
      if (isGroundUnit(card)) groundUnits += qty;
      if (isEvent(card)) events += qty;
      if (isUpgrade(card)) upgrades += qty;
    }

    return {
      spaceUnits,
      groundUnits,
      events,
      upgrades,
    };
  }, [mainDeckDetailed]);

  async function saveDeck() {
    setSaving(true);
    setMessage("");

    const cleanName = deckName.trim() || "New Deck";

    const { error: deckError } = await supabase
      .from("decks")
      .update({
        name: cleanName,
        leader_card_id: leaderCardId,
        base_card_id: baseCardId,
      })
      .eq("id", deck.id);

    if (deckError) {
      setSaving(false);
      setMessage(deckError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("deck_cards")
      .delete()
      .eq("deck_id", deck.id);

    if (deleteError) {
      setSaving(false);
      setMessage(deleteError.message);
      return;
    }

    const rowsToInsert = deckCards
      .filter((item) => Number(item.quantity || 0) > 0)
      .map((item) => ({
        deck_id: deck.id,
        card_id: item.card_id,
        quantity: Number(item.quantity || 0),
      }));

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("deck_cards")
        .insert(rowsToInsert);

      if (insertError) {
        setSaving(false);
        setMessage(insertError.message);
        return;
      }
    }

    setSaving(false);
    setMessage("Deck saved.");
    router.refresh();
  }

  async function deleteDeck() {
    const confirmed = window.confirm("Delete this deck?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("decks")
      .delete()
      .eq("id", deck.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/decks");
    router.refresh();
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(360px, 1.05fr) minmax(360px, 0.95fr)",
        gap: "18px",
        alignItems: "start",
      }}
    >
      <section
        style={{
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "18px",
          background: "linear-gradient(180deg, #172033, #111827)",
          minHeight: "70vh",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ margin: 0, marginBottom: "6px" }}>Collection Browser</h2>
          <div style={{ color: "#94a3b8" }}>
            Search and add cards from your collection.
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search name, set, number, aspect, traits, type, or arena"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              minWidth: "280px",
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
              minWidth: "280px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e5edf7",
            }}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e5edf7",
            }}
          >
            <option value="all">All Types</option>
            <option value="leader">Leader</option>
            <option value="base">Base</option>
            <option value="unit">Unit</option>
            <option value="event">Event</option>
            <option value="upgrade">Upgrade</option>
          </select>

          <select
            value={arenaFilter}
            onChange={(e) => setArenaFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e5edf7",
            }}
          >
            <option value="all">All Arenas</option>
            <option value="ground">Ground</option>
            <option value="space">Space</option>
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "14px",
            maxHeight: "calc(70vh - 130px)",
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >
          {filteredCollection.map((item: any) => {
            const card = item.card;
            const ownedQty = getOwnedCount(item.card_id);
            const availableQty = getAvailableCount(item.card_id);

            return (
              <CollectionCardTile
                key={item.card_id}
                card={card}
                ownedQty={ownedQty}
                availableQty={availableQty}
                leaderSelected={leaderCardId === item.card_id}
                baseSelected={baseCardId === item.card_id}
                onSetLeader={() => chooseLeader(item.card_id)}
                onSetBase={() => chooseBase(item.card_id)}
                onAddToDeck={() => addMainDeckCard(item.card_id)}
              />
            );
          })}
        </div>
      </section>

      <section
        style={{
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "18px",
          background: "linear-gradient(180deg, #172033, #111827)",
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Deck Name"
              style={{
                flex: 1,
                minWidth: "240px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e5edf7",
                fontSize: "18px",
                fontWeight: 700,
              }}
            />

            <button
              type="button"
              onClick={saveDeck}
              disabled={saving}
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #475569",
                background: "#1e293b",
                color: "#e5edf7",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              {saving ? "Saving..." : "Save Deck"}
            </button>

            <button
              type="button"
              onClick={deleteDeck}
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #7f1d1d",
                background: "#2a0f14",
                color: "#fecaca",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Delete Deck
            </button>
          </div>

          {message ? (
            <div
              style={{
                color: message === "Deck saved." ? "#86efac" : "#fecaca",
                fontSize: "14px",
              }}
            >
              {message}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          <div
            style={{
              border: "1px solid #334155",
              borderRadius: "14px",
              padding: "14px",
              background: "#0f172a",
            }}
          >
            <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>Leader</div>
            {leaderCard ? (
              <>
                <div style={{ fontWeight: 700 }}>{leaderCard.name}</div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "4px" }}>
                  {leaderCard.subtitle || ""}
                </div>
                <button
                  type="button"
                  onClick={() => setLeaderCardId(null)}
                  style={{
                    marginTop: "10px",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: "1px solid #475569",
                    background: "#1e293b",
                    color: "#e5edf7",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  Clear Leader
                </button>
              </>
            ) : (
              <div style={{ color: "#64748b", fontSize: "14px" }}>No leader selected</div>
            )}
          </div>

          <div
            style={{
              border: "1px solid #334155",
              borderRadius: "14px",
              padding: "14px",
              background: "#0f172a",
            }}
          >
            <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>Base</div>
            {baseCard ? (
              <>
                <div style={{ fontWeight: 700 }}>{baseCard.name}</div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "4px" }}>
                  {baseCard.subtitle || ""}
                </div>
                <button
                  type="button"
                  onClick={() => setBaseCardId(null)}
                  style={{
                    marginTop: "10px",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: "1px solid #475569",
                    background: "#1e293b",
                    color: "#e5edf7",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  Clear Base
                </button>
              </>
            ) : (
              <div style={{ color: "#64748b", fontSize: "14px" }}>No base selected</div>
            )}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            padding: "14px",
            background: "#0f172a",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "10px" }}>Deck Summary</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "10px",
              fontSize: "14px",
              color: "#cbd5e1",
            }}
          >
            <div>Main Deck: {mainDeckCount} / 50</div>
            <div>Space Units: {summary.spaceUnits}</div>
            <div>Ground Units: {summary.groundUnits}</div>
            <div>Events: {summary.events}</div>
            <div>Upgrades: {summary.upgrades}</div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            padding: "14px",
            background: "#0f172a",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>Main Deck</div>
              <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                Cards currently in this deck
              </div>
            </div>

            <div style={{ color: "#e5edf7", fontWeight: 700 }}>
              {mainDeckCount} / 50
            </div>
          </div>

          {mainDeckDetailed.length === 0 ? (
            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
                border: "1px dashed #334155",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              No main deck cards selected yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "14px",
                maxHeight: "calc(70vh - 360px)",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {mainDeckDetailed
                .slice()
                .sort((a: any, b: any) =>
                  String(a.card?.name || "").localeCompare(String(b.card?.name || ""))
                )
                .map((item: any) => (
                  <DeckCardTile
                    key={item.card_id}
                    card={item.card}
                    quantity={item.quantity}
                    onAdd={() => addMainDeckCard(item.card_id)}
                    onRemove={() => removeMainDeckCard(item.card_id)}
                  />
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}