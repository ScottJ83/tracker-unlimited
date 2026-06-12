import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function deck(id, slug, name, deckType, productWave, leaderName, baseName, sortOrder, cards) {
  return { id, slug, name, deckType, productWave, leaderName, baseName, sortOrder, cards };
}

function c(qty, name, number = null, setCode = null) {
  return { qty, name, number: number ? String(number).replace("*", "") : null, setCodeHint: setCode };
}

const DECKS = [
  deck("sor-luke-starter", "spark-of-rebellion-luke-skywalker-starter", "Luke Skywalker", "Starter Deck", "Spark of Rebellion", "Luke Skywalker, Faithful Friend", "Administrator's Tower", 10, [
    c(1,"Luke Skywalker, Faithful Friend"), c(1,"Administrator's Tower"), c(1,"2-1B Surgical Droid"), c(3,"R2-D2"), c(3,"C-3PO"), c(1,"Rebel Pathfinder"), c(3,"Alliance X-Wing"), c(2,"Restored ARC-170"), c(3,"Leia Organa, Defiant Princess"), c(3,"Fleet Lieutenant"), c(1,"Wing Leader"), c(1,"Yoda, Old Master"), c(1,"Cloud City Wing Guard"), c(1,"System Patrol Craft"), c(3,"Consular Security Force"), c(1,"Auzituck Liberator Gunship"), c(1,"General Dodonna, Massassi Group Commander"), c(1,"Snowspeeder"), c(1,"Chewbacca, Loyal Companion"), c(1,"Vigilant Honor Guards"), c(1,"Obi-Wan Kenobi"), c(1,"Han Solo"), c(1,"Resilient"), c(3,"Luke's Lightsaber"), c(1,"Shoot First"), c(2,"Repair"), c(2,"Asteroid Sanctuary"), c(2,"Surprise Strike"), c(2,"Waylay"), c(3,"Vanquish"), c(1,"Rogue Operative")
  ]),
  deck("sor-vader-starter", "spark-of-rebellion-darth-vader-starter", "Darth Vader", "Starter Deck", "Spark of Rebellion", "Darth Vader, Dark Lord of the Sith", "Command Center", 11, [
    c(1,"Darth Vader, Dark Lord of the Sith"), c(1,"Command Center"), c(2,"AT-ST"), c(3,"Admiral Motti"), c(1,"Admiral Ozzel, Overconfident"), c(1,"Admiral Piett, Captain of the Executor"), c(1,"Blizzard Assault AT-AT"), c(3,"Cell Block Guard"), c(3,"Death Star Stormtrooper"), c(1,"Emperor Palpatine"), c(2,"First Legion Snowtrooper"), c(1,"General Veers, Blizzard Force Commander"), c(3,"Grand Moff Tarkin"), c(2,"Snowtrooper Lieutenant"), c(3,"Superlaser Technician"), c(2,"Viper Probe Droid"), c(1,"Gladiator Star Destroyer"), c(3,"Imperial Interceptor"), c(1,"Relentless"), c(1,"TIE Advanced"), c(2,"TIE/ln Fighter"), c(3,"Vader's Lightsaber"), c(1,"Force Choke"), c(3,"I Am Your Father"), c(1,"Maximum Firepower"), c(3,"Open Fire"), c(1,"Overwhelming Barrage"), c(1,"Recruit"), c(1,"Resupply")
  ]),
  deck("hoth-vader-intro", "intro-battle-hoth-vader", "Darth Vader", "Intro Battle Deck", "Battle of Hoth", "Darth Vader, Don't Fail Me Again", "Forward Command Post", 20, [
    c(1,"Darth Vader, Don't Fail Me Again"), c(1,"Forward Command Post"), c(3,"Snowtrooper Vanguard"), c(2,"Admiral Ozzel, As Clumsy As He Is Stupid"), c(2,"E-Web Gunner"), c(3,"First Legion Trooper"), c(2,"Hoth Lieutenant"), c(3,"Blizzard Force AT-SS"), c(1,"Blizzard One, Veers At The Helm"), c(2,"General Veers, Leading The Assault"), c(1,"Rampaging Wampa"), c(2,"Ground Assault AT-AT"), c(3,"Snowtrooper"), c(2,"Admiral Piett, In Command Now"), c(2,"Imperial Deck Officer"), c(3,"Scouting Tie Fighter"), c(3,"Surface Assault Bomber"), c(3,"Lambda Shuttle"), c(2,"Death Squadron Star Destroyer"), c(1,"Avenger, Hunting The Rebels"), c(2,"Too Strong For Blasters"), c(2,"I Want Proof, Not Leads"), c(1,"You Have Failed Me"), c(1,"The Desolation Of Hoth"), c(2,"We're In Trouble"), c(2,"Target The Main Generator")
  ]),
  deck("hoth-leia-intro", "intro-battle-hoth-leia", "Leia Organa", "Intro Battle Deck", "Battle of Hoth", "Leia Organa, Get To Your Transports!", "Echo Caverns", 21, [
    c(1,"Leia Organa, Get To Your Transports!"), c(1,"Echo Caverns"), c(3,"Echo Coordinator"), c(3,"Hoth Trooper"), c(2,"R2-D2, Known To Make Mistakes"), c(2,"C-3P0, Oh Dear, Oh Dear"), c(2,"General Rieekan, Stalwart Tactician"), c(2,"Ion Cannon"), c(3,"Rogue Squadron Speeder"), c(2,"Chewbacca, Rrruuuurrr"), c(2,"Han Solo, Scruffy-Looking Nerf Herder"), c(1,"Luke Skywalker, Do You Read Me?"), c(3,"Tauntaun Mount"), c(3,"Trench Defender"), c(3,"Evacuation Escort"), c(3,"Rebellion Y-Wing"), c(3,"GR-75 Medium Transport"), c(2,"Bright Hope, Narrow Escape"), c(1,"Millennium Falcon, Bucket Of Bolts"), c(2,"Go For The Legs"), c(2,"I've Found Them"), c(2,"Improvised Detonation"), c(1,"Recovery"), c(2,"I'll Cover For You"), c(1,"Watch This")
  ]),
  deck("shd-mando-spotlight", "mandalorian-spotlight", "The Mandalorian", "Spotlight Deck", "Shadows of the Galaxy", "The Mandalorian", "Remote Village", 30, [
    c(1,"The Mandalorian",18), c(1,"Remote Village",20), c(2,"Clan Wren Rescuer",40), c(3,"Follower of the Way",56), c(3,"Greef Karga",245), c(3,"Grogu",196), c(1,"Kuiil",41), c(3,"HWK-290 Freighter",60), c(1,"Mandalorian Warrior",258), c(2,"Protector of the Throne",247), c(2,"Village Protectors",43), c(2,"Chain Code Collector",216), c(3,"Razor Crest",44), c(1,"Survivors' Gauntlet",64), c(1,"The Armorer",47), c(1,"Cargo Juggernaut",66), c(1,"Fennec Shand",220), c(1,"Public Enemy",68), c(2,"Wanted",221), c(2,"Foundling",69), c(2,"Resilient",70), c(2,"Rich Reward",261), c(2,"Snapshot Reflexes",223), c(1,"Vambrace Grappleshot",74), c(1,"Mandalorian Armor",73), c(3,"The Mandalorian's Rifle",251), c(1,"Surprise Strike",231), c(1,"This Is The Way",253), c(1,"Spare The Target",206), c(1,"Fell The Dragon",78)
  ]),
  deck("shd-moff-spotlight", "moff-gideon-spotlight", "Moff Gideon", "Spotlight Deck", "Shadows of the Galaxy", "Moff Gideon", "Remnant Science Facility", 31, [
    c(1,"Moff Gideon",7), c(1,"Remnant Science Facility",19), c(2,"Warzone Lieutenant",110), c(1,"Doctor Pershing",28), c(1,"General Tagge",81), c(3,"Incinerator Trooper",234), c(3,"Outland TIE Vanguard",82), c(1,"Privateer Crew",113), c(3,"Seasoned Shoretrooper",83), c(2,"Snowtrooper Lieutenant",236), c(2,"Cell Block Guard",238), c(3,"Death Trooper",30), c(3,"Phase-III Dark Trooper",84), c(3,"Superlaser Technician",85), c(1,"The Client",31), c(1,"Kihraxz Heavy Fighter",118), c(2,"System Patrol Craft",63), c(1,"Discerning Veteran",120), c(2,"Pirate Battle Tank",89), c(3,"Gideon's Light Cruiser",242), c(1,"Top Target",71), c(1,"Legal Authority",124), c(2,"Price On Your Head",125), c(1,"Outflank",128), c(1,"Timely Intervention",129), c(2,"Confiscate",262), c(1,"Moment of Glory",130), c(3,"Calculated Lethality",39), c(1,"Remnant Reserves",93)
  ]),
  deck("jtl-han-spotlight", "han-solo-spotlight", "Han Solo", "Spotlight Deck", "Jump to Lightspeed", "Han Solo", "Echo Base", 50, [c(1,"Han Solo",17),c(1,"Echo Base",24),c(3,"Clone Deserter",95),c(2,"Greedo",204),c(1,"Nien Nunb",93),c(2,"R2-D2",245),c(3,"Dagger Squadron Pilot",196),c(3,"Cartel Turncoat",195),c(3,"Wolf Pack Escort",191),c(1,"Admiral Ackbar",97),c(1,"Huyang",110),c(2,"Leia Organa",97),c(2,"Ezra Bridger",192),c(2,"BoShek",215),c(2,"Blue Leader",96),c(3,"Shuttle Tydirium",200),c(1,"Death Space Skirmisher",217),c(3,"Millennium Falcon",249),c(3,"Chewbacca",103),c(1,"Clone Commander Cody",114),c(1,"The Mandalorian",210),c(2,"Tandem Assault",124),c(1,"Shoot First",217),c(3,"Waylay",222),c(3,"Never Tell Me The Odds",208),c(1,"It's A Trap",209),c(1,"Commandeered",235)]),
  deck("jtl-boba-spotlight", "boba-fett-spotlight", "Boba Fett", "Spotlight Deck", "Jump to Lightspeed", "Boba Fett", "Jabba's Palace", 51, [c(1,"Boba Fett",9),c(1,"Jabba's Palace",26),c(3,"First Order Stormtrooper",132),c(1,"Allegiant General Pryde",133),c(3,"First Legion Snowtrooper",130),c(3,"Zygerrian Starhopper",183),c(3,"TIE Bomber",237),c(2,"Fifth Brother",131),c(2,"Elite P-38 Starfighter",181),c(3,"Hound's Tooth",185),c(3,"Bossk",187),c(2,"Dengar",139),c(3,"Fett's Firespray",240),c(1,"IG-2000",140),c(2,"Hunting Aggressor",165),c(2,"Imperial Interceptor",132),c(1,"IG-88",141),c(1,"Boba Fett",189),c(1,"Fett's Firespray",184),c(1,"Electromagnetic Pulse",230),c(3,"Daring Raid",178),c(1,"Grenade Strike",171),c(3,"No Good To Me Dead",186),c(3,"Force Choke",139),c(3,"No Disintegrations",144)]),
  deck("lof-qui-gon-spotlight", "qui-gon-jinn-spotlight", "Qui-Gon Jinn", "Spotlight Deck", "Legends of the Force", "Qui-Gon Jinn", "Jedi Temple", 60, [c(1,"Qui-Gon Jinn",16),c(1,"Jedi Temple",23),c(1,"Maz Kanata",96),c(1,"Ahsoka Tano",203),c(1,"Luke Skywalker",249),c(1,"Luminous Beings",104),c(1,"Sneak Attack",219),c(3,"Anakin Skywalker",190),c(3,"Refugee of the Path",242),c(3,"Curious Flock",255),c(2,"R2-D2",193),c(3,"Youngling Padawan",193),c(3,"Obi-Wan Kenobi",96),c(2,"Maz Kanata",111),c(2,"J-Type Nubian Starship",194),c(3,"Jedi Sentinel",196),c(2,"Paladin Training Corvette",99),c(3,"Qui-Gon Jinn's Ethersprite",197),c(2,"Stinger Mantis",198),c(2,"Depa Billaba",199),c(2,"Kelleran Beq",100),c(2,"Tri-Droid Suppressor",217),c(3,"Qui-Gon Jinn's Lightsaber",200),c(2,"Impossible Escape",218),c(3,"The Will of the Force",227)]),
  deck("lof-maul-spotlight", "darth-maul-spotlight", "Darth Maul", "Spotlight Deck", "Legends of the Force", "Darth Maul", "Shadowed Undercity", 61, [c(1,"Darth Maul",9),c(1,"Shadowed Undercity",21),c(1,"Oggdo Bogdo",63),c(1,"Pong Krell",30),c(1,"Count Dooku",138),c(1,"Sith Holocron",138),c(1,"Fallen Lightsaber",137),c(3,"Witch of the Mist",154),c(2,"Karis",31),c(3,"Nightsister Warrior",59),c(2,"Acolyte of the Beyond",129),c(3,"Strikeship",131),c(2,"Infused Brawler",156),c(2,"Kylo Ren",229),c(2,"Merrin",160),c(3,"Talzin's Assassin",35),c(2,"Chirrut Îmwe",67),c(3,"Darth Tyranus",231),c(3,"Scimitar",233),c(2,"Thralls of the Coven",136),c(2,"Savage Opress",137),c(3,"Darth Sidious",39),c(3,"Darth Maul's Lightsaber",140),c(3,"Drain Essence",41),c(2,"Force Choke",139)]),
  deck("sec-padme-spotlight", "padme-amidala-spotlight", "Padmé Amidala", "Spotlight Deck", "Secrets of Power", "Padmé Amidala", "Senate Rotunda", 70, [c(1,"Padmé Amidala",16,"SEC"),c(1,"Senate Rotunda",22,"SEC"),c(1,"B2EMO",248,"SEC"),c(1,"C-3PO",93,"SEC"),c(3,"Furtive Handmaiden",197,"SEC"),c(2,"Bail Organa",198,"LOF"),c(2,"Bravo Squadron Fighter",199,"LOF"),c(1,"Jar Jar Binks",111,"SEC"),c(2,"Mina Bonteri",94,"SEC"),c(2,"N-1 Starfighter",192,"SEC"),c(1,"Seasoned Fleet Admiral",113,"SEC"),c(3,"Ahsoka Tano",96,"SEC"),c(3,"Anakin Skywalker",201,"SEC"),c(3,"J-Type Nubian Starship",194,"LOF"),c(1,"Taylander Shuttle",115,"SEC"),c(3,"Captain Typho",98,"SEC"),c(2,"Nubian Star Skiff",116,"SEC"),c(1,"Naboo Royal Starship",99,"SEC"),c(2,"Stinger Mantis",198,"LOF"),c(1,"Hunter",208,"SEC"),c(2,"Naboo Security Force",120,"SEC"),c(1,"Kelleran Beq",100,"SEC"),c(1,"Mon Mothma",103,"SEC"),c(2,"Dogfight",125,"JTL"),c(3,"Sneaking Suspicion",226,"SEC"),c(2,"Bog Down In Procedure",234,"SEC"),c(1,"Charged With Corruption",127,"SEC"),c(1,"Moral Authority",256,"SEC"),c(2,"With Thunderous Applause",129,"SEC"),c(1,"Dismantle The Conspiracy",106,"SEC")]),
  deck("sec-palpatine-spotlight", "chancellor-palpatine-spotlight", "Chancellor Palpatine", "Spotlight Deck", "Secrets of Power", "Chancellor Palpatine", "Senate Rotunda", 71, [c(1,"Chancellor Palpatine",1),c(1,"Senate Rotunda",22),c(3,"Corrupt Politician",79),c(2,"Dhani Pilgrim",55),c(1,"Jar Jar Binks",111),c(1,"Major Partagaz",81),c(3,"Onyx Squadron Brute",35),c(3,"The Chancellor's Shuttle",27),c(2,"Vanee",82),c(1,"Chancellor Palpatine",82),c(1,"Nute Gunray",31),c(3,"ISB Shuttle",83),c(3,"Political Bully",241),c(2,"Mas Amedda",85),c(2,"Sly Moore",32),c(1,"Vice Admiral Rampart",84),c(3,"Cad Bane",34),c(1,"Dedra Meero",87),c(3,"Dogmatic Shock Squad",36),c(3,"I Am The Senate",92),c(1,"Cantwell Arrestor Cruiser",37),c(2,"When Has Become Now",245),c(2,"Armor Of Fortune",70),c(2,"Budget Scheming",124),c(2,"Unveiled Might",123),c(1,"Charged With Murder",76),c(2,"Retaliation",77),c(1,"The Tragedy Of Plagueis",43)]),
  deck("twi-ahsoka-spotlight", "ahsoka-tano-spotlight", "Ahsoka Tano", "Spotlight Deck", "Twilight of the Republic", "Ahsoka Tano", "Tipoca City", 80, [c(1,"Ahsoka Tano",11),c(1,"Tipoca City",24),c(3,"332nd Stalwart",240),c(1,"Soldier of the 501st",141),c(1,"Anakin's Interceptor",142),c(2,"Clone Heavy Gunner",158),c(2,"Coruscant Guard",106),c(2,"Dendup's Loyalist",159),c(1,"Echo",90),c(1,"Patrolling V-Wing",107),c(3,"Phase I Clone Trooper",241),c(1,"Republic Tactical Officer",91),c(1,"Admiral Yularen",92),c(1,"501st Liberator",109),c(1,"Batch Brothers",144),c(2,"Republic Commando",243),c(2,"Drop In",251),c(1,"HEVY",164),c(1,"Shaak Ti",94),c(3,"Anakin Skywalker",147),c(1,"Clone Commander Cody",114),c(1,"ETA-2 Light Interceptor",244),c(1,"Captain Rex",97),c(1,"Tranquility",246),c(3,"Ahsoka's Padawan Lightsaber",248),c(2,"Outflank",123),c(2,"Grenade Strike",171),c(1,"Synchronize Strike",99),c(2,"Encouraging Leadership",126),c(3,"Open Fire",174)]),
  deck("twi-grievous-spotlight", "general-grievous-spotlight", "General Grievous", "Spotlight Deck", "Twilight of the Republic", "General Grievous", "Lair of Grievous", 81, [c(1,"General Grievous",15),c(1,"Lair of Grievous",23),c(2,"Droid Starfighter",228),c(1,"Independent Senator",208),c(3,"Obedient Vanguard",104),c(1,"Soulless One",179),c(1,"B1 Security Team",207),c(2,"Confederate Courier",79),c(2,"Droid Deployment",237),c(1,"Poggle the Lesser",80),c(3,"Separatist Commando",180),c(3,"Battle Droid Escort",229),c(1,"Magnaguard Wing Leader",82),c(2,"Super Battle Droid",230),c(1,"General's Guardian",83),c(1,"On The Doorstep",190),c(1,"Subjugating Starfighter",112),c(1,"Kraken",84),c(1,"Tactical Droid Commander",184),c(1,"Admiral Trench",86),c(1,"Tri-Droid Suppressor",217),c(2,"Hailfire Tank",233),c(1,"The Invisible Hand",234),c(1,"Separatist Super Tank",87),c(2,"In Pursuit",221),c(1,"Droid Cohort",218),c(1,"Political Pressure",222),c(2,"Tactical Advantage",124),c(1,"Private Manufacturing",257),c(3,"Merciless Contest",238),c(2,"Waylay",226),c(3,"Grievous's Wheel Bike",236)])
];

function normalize(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function cardNumber(card) {
  return String(card?.number || card?.card_number || card?.collector_number || card?.collectorNumber || "").replace(/^0+/, "");
}

function cardName(card) {
  return card?.name || card?.title || "";
}

function imageFor(card) {
  return card?.image_url || card?.image || card?.front_image_url || card?.art_url || card?.card_image || null;
}

async function fetchAllCards() {
  const rows = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from("cards").select("*").range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

function findCard(deckCard, allCards) {
  const wantedName = normalize(deckCard.name);
  const wantedNumber = deckCard.number ? String(deckCard.number).replace(/^0+/, "") : null;
  const wantedSet = deckCard.setCodeHint ? deckCard.setCodeHint.toLowerCase() : null;

  let matches = allCards.filter((card) => normalize(cardName(card)) === wantedName);
  if (wantedNumber) {
    const numberMatches = matches.filter((card) => cardNumber(card) === wantedNumber);
    if (numberMatches.length) matches = numberMatches;
  }
  if (wantedSet) {
    const setMatches = matches.filter((card) => String(card.set_code || card.set || card.setCode || "").toLowerCase() === wantedSet);
    if (setMatches.length) matches = setMatches;
  }
  return matches[0] || null;
}

async function main() {
  const allCards = await fetchAllCards();
  console.log(`Loaded ${allCards.length} SWU cards for matching.`);

  let deckCount = 0;
  let lineCount = 0;
  let matched = 0;
  let unmatched = [];

  for (const item of DECKS) {
    await supabase.from("swu_premade_decks").upsert({
      id: item.id,
      slug: item.slug,
      name: item.name,
      deck_type: item.deckType,
      product_wave: item.productWave,
      leader_name: item.leaderName,
      base_name: item.baseName,
      sort_order: item.sortOrder,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" }).throwOnError();

    for (const card of item.cards) {
      const found = findCard(card, allCards);
      if (found) matched += 1;
      else unmatched.push(`${item.name}: ${card.name}${card.number ? ` #${card.number}` : ""}`);

      await supabase.from("swu_premade_deck_cards").upsert({
        deck_id: item.id,
        card_name: card.name,
        quantity: card.qty,
        card_number: card.number,
        set_code_hint: card.setCodeHint,
        role: "main",
        resolved_card_id: found?.id || null,
        card_snapshot: found ? { ...found, _image: imageFor(found) } : null,
        match_status: found ? "matched" : "unmatched",
        updated_at: new Date().toISOString(),
      }, { onConflict: "deck_id,card_name,coalesce(card_number, ''),role" }).throwOnError();
      lineCount += 1;
    }
    deckCount += 1;
  }

  console.log(JSON.stringify({ decksSeeded: deckCount, linesSeeded: lineCount, matched, unmatched: unmatched.length, unmatchedSample: unmatched.slice(0, 50) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
