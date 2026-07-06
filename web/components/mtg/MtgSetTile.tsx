import Link from "next/link";
import MtgProgress from "./MtgProgress";

export default function MtgSetTile({ set }: { set: any }) {
  return (
    <Link href={`/mtg/sets/${set.code}`} className="mtg-set-tile">
      <div className="mtg-set-symbol">{set.icon_svg_uri ? <img src={set.icon_svg_uri} alt="" /> : <span>✦</span>}</div>
      <div>
        <p className="mtg-kicker">{set.set_type || "Set"}</p>
        <h3>{set.name}</h3>
        <p>{set.released_at || "Release date unknown"}</p>
      </div>
      <MtgProgress label="Completion" value={set.completion || 0} detail={`${set.ownedPrintings || 0} / ${set.printTotal || set.card_count || 0} printings`} />
    </Link>
  );
}
