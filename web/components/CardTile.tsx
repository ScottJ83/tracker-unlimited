"use client";
import { useState } from "react";
type FooterItem = {
  label: string;
  value: string | number;
  color?: string;
  bold?: boolean;
};

type Props = {
  card: any;
  owned?: boolean;
  hidden?: boolean;
  showSetLine?: boolean;
  showTypeLine?: boolean;
  footerItems?: FooterItem[];
  actionSlot?: React.ReactNode;
  minHeight?: number;
  bottomPadding?: number;
};

function getAspectPills(aspect: string | null | undefined) {
  const text = String(aspect || "").toLowerCase();
  const pills: { name: string; color: string }[] = [];

  if (text.includes("vigilance")) pills.push({ name: "Vigilance", color: "#4ea3ff" });
  if (text.includes("command")) pills.push({ name: "Command", color: "#2cd97b" });
  if (text.includes("aggression")) pills.push({ name: "Aggression", color: "#ff4d5e" });
  if (text.includes("cunning")) pills.push({ name: "Cunning", color: "#ffb347" });
  if (text.includes("heroism")) pills.push({ name: "Heroism", color: "#f2f2d0" });
  if (text.includes("villainy")) pills.push({ name: "Villainy", color: "#8b5cf6" });

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
        padding: "4px 7px",
        borderRadius: "999px",
        background: `linear-gradient(180deg, ${color}24, ${color}10)`,
        border: `1px solid ${color}`,
        color,
        fontWeight: 700,
        whiteSpace: "nowrap",
        boxShadow: `0 0 10px ${color}22`,
      }}
    >
      {label}: {value}
    </div>
  );
}

function CardImage({
  src,
  name,
  hidden,
}: {
  src?: string | null;
  name: string;
  hidden?: boolean;
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
        border: "1px solid rgba(148, 163, 184, 0.35)",
        background:
          "linear-gradient(180deg, rgba(10, 16, 28, 0.98), rgba(4, 8, 16, 0.98))",
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
      }}
      onMouseEnter={() => {
        if (!hidden && src) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      {!hidden && src ? (
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
                border: "1px solid rgba(125, 211, 252, 0.35)",
                boxShadow:
                  "0 20px 50px rgba(0,0,0,0.65), 0 0 24px rgba(125, 211, 252, 0.18)",
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
            color: "#5b6b83",
            userSelect: "none",
            letterSpacing: "0.08em",
          }}
        >
          —
        </div>
      )}
    </div>
  );
}

function getCardTypeLabel(card: any) {
  return String(card?.card_type || card?.type || "").trim();
}

function getArenaLabel(card: any) {
  return String(card?.arena || "").trim();
}

export default function CardTile({
  card,
  owned = true,
  hidden = false,
  showSetLine = false,
  showTypeLine = false,
  footerItems = [],
  actionSlot,
  minHeight = 155,
  bottomPadding = 46,
}: Props) {
  const aspectPills = getAspectPills(card?.aspect);

const borderColor = owned
  ? "rgba(255,255,255,0.35)"
  : "rgba(255,255,255,0.15)";

  const panelBackground = owned
    ? "linear-gradient(180deg, rgba(10, 19, 38, 0.96), rgba(6, 11, 22, 0.96))"
    : "linear-gradient(180deg, rgba(7, 10, 16, 0.96), rgba(4, 7, 12, 0.96))";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
borderRadius: "6px",
        padding: "10px",
        minHeight,
background: "linear-gradient(180deg, #060c18, #02060c)",
        display: "flex",
        gap: "10px",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ width: "56px", minWidth: "56px" }}>
        <CardImage
          src={card?.front_art}
          name={card?.name || "Card"}
          hidden={hidden}
        />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          paddingBottom: actionSlot ? `${bottomPadding}px` : 0,
        }}
      >
        {hidden ? (
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                color: "#9fb0c8",
                letterSpacing: "0.04em",
              }}
            >
              #{card?.card_number ?? "-"}
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#9fb0c8",
                marginTop: "4px",
              }}
            >
              Variant: {card?.variant || "-"}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "8px",
                fontSize: "11px",
              }}
            >
              {footerItems.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  style={{
                    color: item.color || "#cbd5e1",
                    fontWeight: item.bold ? 700 : 400,
                  }}
                >
                  {item.label}: {item.value}
                </div>
              ))}
            </div>
          </div>
        ) : (
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
                    color: "#edf4ff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    letterSpacing: "0.01em",
                  }}
                >
                  {card?.name || "Unknown card"}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#9fb0c8",
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
                  maxWidth: "126px",
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
                  <StatPill label="Cost" value={card?.cost} color="#f2c94c" />
                  <StatPill label="Power" value={card?.power} color="#ff4d5e" />
                  <StatPill label="HP" value={card?.hp} color="#4ea3ff" />
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
                        borderRadius: "6px",
                        background: `linear-gradient(180deg, ${pill.color}20, ${pill.color}0f)`,
                        border: `1px solid ${pill.color}`,
                        color: pill.color,
                        whiteSpace: "nowrap",
                        boxShadow: `0 0 10px ${pill.color}1f`,
                      }}
                    >
                      {pill.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {showSetLine ? (
              <div
                style={{
                  fontSize: "11px",
                  marginTop: "5px",
                  color: "#cdd8e8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Set: {card?.set_code || "-"}
              </div>
            ) : null}

            <div
              style={{
                fontSize: "11px",
                marginTop: "5px",
                color: "#cdd8e8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              #{card?.card_number ?? "-"} • {card?.variant || "-"}
            </div>

            {showTypeLine ? (
              <div
                style={{
                  fontSize: "11px",
                  color: "#cdd8e8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Type: {getCardTypeLabel(card) || "-"}
                {getArenaLabel(card) ? ` • ${getArenaLabel(card)}` : ""}
              </div>
            ) : null}

            <div
              style={{
                fontSize: "11px",
                color: "#cdd8e8",
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
                color: "#d7e2f0",
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

            {footerItems.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "6px",
                  fontSize: "11px",
                }}
              >
                {footerItems.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    style={{
                      color: item.color || "#cbd5e1",
                      fontWeight: item.bold ? 700 : 400,
                    }}
                  >
                    {item.label}: {item.value}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {actionSlot ? (
        <div
          style={{
            position: "absolute",
            right: "10px",
            bottom: "8px",
          }}
        >
          {actionSlot}
        </div>
      ) : null}
    </div>
  );
}