import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

function clamp(v:number,a:number,b:number){ return Math.max(a, Math.min(b, v)); }
function min(a:number,b:number){ return a<b?a:b; }

export async function POST(req: NextRequest){
  try{
    const { scenario = "cold", transcript = [] } = await req.json().catch(()=>({}));
    const agentText = transcript.filter((m:any)=>m.role==="agent").map((m:any)=>m.text||"").join(" ").toLowerCase();
    const aiText = transcript.filter((m:any)=>m.role==="ai").map((m:any)=>m.text||"").join(" ");
    const qCount = (agentText.match(/\?/g)||[]).length;
    const discovery = ["bedarf","ziel","problem","herausforderung","prozess","entscheidung","zeitrahmen","kriterien","stakeholder"];
    const value = ["nutzen","vorteil","roi","zeit sparen","kosten senken","umsatz","effizienz","qualitaet","risiko","sicherheit"];
    const closing = ["termin","angebot","vertrag","start","demo","naechster schritt","wie geht es weiter"];
    const objections = ["zu teuer","kein bedarf","keine zeit","schon lieferant","kein interesse","spaeter","budget","entscheidung","chef","daten schicken"];
    const d = discovery.filter(k=>agentText.includes(k)).length;
    const v = value.filter(k=>agentText.includes(k)).length;
    const c = closing.filter(k=>agentText.includes(k)).length;
    const o = objections.filter(k=>agentText.includes(k)).length;
    const agentLen = agentText.length;
    const totalLen = agentLen + aiText.length || 1;
    const talkRatio = clamp(agentLen/totalLen,0,1);
    const structure = clamp((d>=3?0.35:d*0.08)+(v>=2?0.25:v*0.1),0,0.6);
    const handling = clamp(0.2 - o*0.03 + Math.min(c*0.05,0.1),0,0.3);
    const balance = clamp(0.2 - Math.abs(0.55 - talkRatio),0,0.2);
    const questioning = clamp(min(qCount*0.02,0.2),0,0.2);
    let raw = structure + handling + balance + questioning;
    raw = clamp(raw,0.05,0.95);
    const score = Math.round(raw*100);
    const strengths = [];
    if(d>=3) strengths.push("Bedarfsanalyse");
    if(v>=2) strengths.push("Nutzenargumentation");
    if(questioning>0.12) strengths.push("Fragetechnik");
    if(balance>0.12) strengths.push("Gespraechssteuerung");
    const improves = [];
    if(d<3) improves.push("mind. 3 Discovery-Fragen stellen");
    if(v<2) improves.push("Nutzen mit KPI verknuepfen");
    if(o>0) improves.push("Einwaende spiegeln und verengen");
    if(c<1) improves.push("klaren Next Step sichern");
    const actions = [
      "15-Sekunden-Nutzenpitch schreiben",
      "SPIN: Situation, Problem, Impact, Need-Payoff",
      "Einwaende mit Frage-Rahmen-Angebot behandeln",
      "Termin oder Startdatum konkret sichern"
    ];
    return NextResponse.json({ score, strengths, improves, actions, scenario });
  }catch(e:any){
    return NextResponse.json({ error: e?.message||String(e) }, { status: 500 });
  }
}
