import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// kleiner Textbaustein-Pool je Szenario
const POOLS: Record<string,string[]> = {
  cold: [
    "Ich habe nur 60 Sekunden. Worum geht es konkret?",
    "Welches Problem loesen Sie mir diese Woche, nicht naechstes Jahr?",
    "Wenn ich heute nichts unterschreibe, was verliere ich?"
  ],
  discovery: [
    "Welche 3 KPIs sind fuer Sie kritisch dieses Quartal?",
    "Wie treffen Sie die Entscheidung, wer sitzt mit am Tisch?",
    "Was blockiert aktuell den Fortschritt am staerksten?"
  ],
  objection: [
    "Verstehe. Was muesste passieren, damit der Preis sich rechnet?",
    "Welche Alternative waere realistisch und warum ist die besser?",
    "Welches Risiko sehen Sie konkret, nicht allgemein?"
  ],
  closing: [
    "Naechster Schritt: 30-Min Demo morgen 10 Uhr. Passt?",
    "Wenn nicht morgen, welcher Slot diese Woche ist realistisch?",
    "Ich schicke das Kurzangebot. Wer zeichnet es gegen?"
  ],
  cross: [
    "Nutzen Sie X bereits? Oft spart das 20 Prozent Zeit im Team.",
    "Wem im Team wuerde das zuerst helfen? Vertrieb, Support oder Ops?",
    "Wenn wir klein starten: welches Team ab naechster Woche?"
  ]
};

// einfache Demo-Antwort mit Varianz
function demoReply(scenario: string, user: string, lastAi: string){
  const pool = POOLS[scenario] || POOLS.cold;
  const seed = (user+lastAi+scenario).length;
  const pick = pool[seed % pool.length];
  const nudges = [
    "Sagen Sie mir eine Zahl.",
    "Was ist Ihr Engpass?",
    "Welcher Termin passt realistisch?"
  ];
  const tail = nudges[seed % nudges.length];
  return `${pick} ${tail}`;
}

function sys(s: string){
  const persona: Record<string,string> = {
    cold: "Direkt, druckvoll, nutzenfokussiert.",
    discovery: "Analytisch, fragt nach KPIs und Prozess.",
    objection: "Spiegelt Einwaende, verengt, fordert Begruendung.",
    closing: "Auf Abschluss und Termin fokussiert.",
    cross: "Sucht Cross-/Upselling Signale."
  };
  return `Rolle: ${persona[s]||persona.cold}. Regeln: 1-3 Saetze, Deutsch, realistisch, keine Wiederholungen.`;
}

export async function POST(req: NextRequest){
  try{
    const { messages = [], scenario = "cold" } = await req.json().catch(()=>({}));
    const lastUser = [...messages].reverse().find((m:any)=>m.role==="user")?.content || "";
    const lastAi = [...messages].reverse().find((m:any)=>m.role==="assistant")?.content || "";

    // Fallback ohne Kosten: wenn kein Key gesetzt ist oder DEMO_MODE aktiv ist
    if(!process.env.OPENAI_API_KEY || process.env.DEMO_MODE === "1"){
      const text = demoReply(scenario, String(lastUser), String(lastAi));
      return NextResponse.json({ text, mode: "demo" });
    }

    // echter Aufruf bleibt kompatibel, falls spaeter Billing aktiv
    const body = {
      model: "gpt-4o-mini",
      temperature: 0.9,
      top_p: 0.9,
      frequency_penalty: 0.6,
      presence_penalty: 0.4,
      messages: [
        { role:"system", content: sys(scenario) },
        ...messages
      ]
    };
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify(body)
    });
    if(!r.ok){
      const t = await r.text();
      // bei 429 automatisch auf Demo schalten
      if(r.status===429) {
        const text = demoReply(scenario, String(lastUser), String(lastAi));
        return NextResponse.json({ text, mode: "demo-429", note: t });
      }
      return NextResponse.json({ error: `OpenAI ${r.status}: ${t}` }, { status: 500 });
    }
    const data = await r.json();
    return NextResponse.json({ text: data.choices?.[0]?.message?.content || "Ok.", mode: "openai" });
  }catch(e:any){
    // harte Fehler -> Demo statt Abbruch
    const text = demoReply("cold", "", "");
    return NextResponse.json({ text, mode: "demo-error", note: e?.message||String(e) });
  }
}
