import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

function sys(s: string){
  const persona: Record<string,string> = {
    cold: "Direkt, pushy, Nutzenfokus. Knappe Antworten. Rueckfragen. Varianz, keine Wiederholungen.",
    discovery: "KPIs, aktives Zuhoeren, kritische Fragen.",
    closing: "ROI, Risiko, Next Step.",
    objection: "Bei Preis, Nutzen, Risiko nachhaken. Begruendung fordern.",
    cross: "Cross-/Upselling Signale erkennen. Bedarf und Timing abfragen."
  };
  return `Rolle: ${persona[s]||persona.cold}
Regeln: 1-3 Saetze. Realistisch. Keine identischen Wiederholungen. Deutsch.`;
}

export async function POST(req: NextRequest){
  try{
    const { messages = [], scenario = "cold", lastAi = "" } = await req.json().catch(()=>({}));
    if(!process.env.OPENAI_API_KEY){
      return NextResponse.json({ error: "OPENAI_API_KEY fehlt" }, { status: 500 });
    }
    const body = {
      model: "gpt-4o-mini",
      temperature: 0.9,
      top_p: 0.9,
      frequency_penalty: 0.6,
      presence_penalty: 0.4,
      messages: [
        { role:"system", content: sys(scenario) },
        lastAi ? { role:"system", content:`Wiederhole niemals: "${String(lastAi).slice(0,150)}"` } : undefined,
        ...messages
      ].filter(Boolean)
    };
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify(body)
    });
    if(!r.ok){
      const t = await r.text();
      return NextResponse.json({ error: `OpenAI ${r.status}: ${t}` }, { status: 500 });
    }
    const data = await r.json();
    return NextResponse.json({ text: data.choices?.[0]?.message?.content || "Ok." });
  }catch(e:any){
    return NextResponse.json({ error: `Serverfehler: ${e?.message||String(e)}` }, { status: 500 });
  }
}
