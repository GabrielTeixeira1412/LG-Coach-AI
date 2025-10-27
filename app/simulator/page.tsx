"use client";
import React, { useEffect, useRef, useState } from "react";

type Msg = { id: string; role: "agent"|"ai"; text: string };

const scenarios = [
  { id: "cold", label: "Kaltakquise" },
  { id: "discovery", label: "Bedarfsanalyse" },
  { id: "objection", label: "Einwandbehandlung" },
  { id: "closing", label: "Abschluss" },
  { id: "cross", label: "Cross-/Upselling" }
];

const QUICK: Record<string,string[]> = {
  cold: [
    "Guten Tag Herr Becker, darf ich in 20 Sekunden sagen, warum ich anrufe?",
    "Wenn es passt, sichern wir einen 15-Min Slot diese Woche."
  ],
  discovery: [
    "Welche 2 KPIs sind fuer Sie dieses Quartal am wichtigsten?",
    "Wie messen Sie Erfolg in diesem Bereich heute?"
  ],
  objection: [
    "Angenommen der ROI passt: was waere Ihr naechster Schritt?",
    "Welche Bedingung muesste erfuellt sein, damit der Preis ok ist?"
  ],
  closing: [
    "Lassen Sie uns Dienstag 10:00 ansetzen. Passt das?",
    "Wenn nein, welcher Slot diese Woche ist realistisch?"
  ],
  cross: [
    "Nutzen Sie Feature X bereits im Team?",
    "Welches Team profitiert zuerst, Vertrieb oder Support?"
  ]
};

function opener(id:string){
  if(id==="cold") return "Becker hier. Wer ist da? Ich habe nur kurz Zeit.";
  if(id==="discovery") return "Koenig hier. Welche Ziele verfolgen wir heute?";
  if(id==="objection") return "Mir ist das zu teuer. Warum sollte ich wechseln?";
  if(id==="closing") return "Kommen Sie zum Punkt. Was schlagen Sie vor?";
  return "Was genau bieten Sie mir an und warum jetzt?";
}

export default function Page(){
  const [scenario, setScenario] = useState<string>("cold");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(()=>{
    if(typeof window === "undefined") return;
    const SR:any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if(SR){
      const rec = new SR();
      rec.lang = "de-DE";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = ()=> setRecognizing(true);
      rec.onend = ()=> setRecognizing(false);
      rec.onresult = (e:any)=> setInput(e.results[0][0].transcript);
      recRef.current = rec;
    }
  },[]);

  const speak = (text:string)=>{
    if(typeof window === "undefined") return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const start = ()=>{
    if(running) return;
    const first:Msg = { id: crypto.randomUUID(), role:"ai", text: opener(scenario) };
    setMessages([first]);
    speak(first.text);
    setRunning(true);
  };

  const stop = async ()=>{
    setRunning(false);
    const key = "ai-call-coach-sessions";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push({ ts: Date.now(), scenario, messages });
    localStorage.setItem(key, JSON.stringify(list));
    try{
      const res = await fetch("/api/eval", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ scenario, transcript: messages })
      });
      const data = await res.json();
      alert(`Score: ${data?.score||"-"}\nStaerken: ${(data?.strengths||[]).join(", ")}\nVerbessern: ${(data?.improves||[]).join(", ")}`);
      const lst = JSON.parse(localStorage.getItem(key) || "[]");
      lst[lst.length-1].eval = data;
      localStorage.setItem(key, JSON.stringify(lst));
    }catch{}
  };

  const send = async ()=>{
    if(!running || !input.trim()) return;
    const user = { id: crypto.randomUUID(), role:"agent" as const, text: input.trim() };
    const next = [...messages, user];
    setMessages(next);
    setInput("");

    const lastAi = [...messages].reverse().find(m=>m.role==="ai")?.text || "";
    try{
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          scenario,
          lastAi,
          messages: next.map(m=>({ role: m.role==="agent" ? "user":"assistant", content: m.text }))
        })
      });
      const data = await res.json();
      const text = res.ok ? String(data.text||"Ok.") : String(data.error||"Fehler");
      const ai:Msg = { id: crypto.randomUUID(), role:"ai", text };
      setMessages(prev=>[...prev, ai]);
      speak(ai.text);
    }catch{
      const ai:Msg = { id: crypto.randomUUID(), role:"ai", text: "KI nicht erreichbar." };
      setMessages(prev=>[...prev, ai]);
      speak(ai.text);
    }
  };

  const toggleMic = ()=>{
    if(!recRef.current) return;
    if(recognizing){ recRef.current.stop(); return; }
    recRef.current.start();
  };

  return (
    <main className="max-w-6xl mx-auto p-6 grid gap-4 md:grid-cols-3">
      <div className="bg-white p-4 rounded-2xl shadow space-y-3">
        <h2 className="font-semibold">Setup</h2>
        <label className="block text-sm">Szenario</label>
        <select value={scenario} onChange={e=>setScenario(e.target.value)} disabled={running} className="w-full border rounded p-2">
          {scenarios.map(s=>(<option key={s.id} value={s.id}>{s.label}</option>))}
        </select>
        {!running
          ? <button onClick={start} className="px-3 py-2 rounded-xl bg-green-600 text-white w-full">Start</button>
          : <button onClick={stop} className="px-3 py-2 rounded-xl bg-red-600 text-white w-full">Stop & Auswerten</button>}
        <div className="text-xs text-gray-600">
          Leitfaden: 3 Discovery-Fragen, 2 Nutzen mit KPI, Next Step sichern.
        </div>
        <div className="grid grid-cols-1 gap-2">
          {(QUICK[scenario]||[]).map((q,i)=>(
            <button key={i} onClick={()=>setInput(q)} className="text-left border rounded px-3 py-2 hover:bg-gray-50">{q}</button>
          ))}
        </div>
        <div>
          <button onClick={toggleMic} className="px-3 py-2 rounded-xl border w-full">
            {recognizing? "Mikro stop" : "Mikro aufnehmen"}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow md:col-span-2 flex flex-col h-[70vh]">
        <div className="flex-1 overflow-auto space-y-3">
          {messages.map(m=>(
            <div key={m.id} className={m.role==='agent'?'ml-auto max-w-[85%]':''}>
              <div className={(m.role==='agent'?'bg-blue-600 text-white':'bg-gray-100') + ' rounded-2xl px-3 py-2'}>{m.text}</div>
              <div className="text-[10px] text-gray-500 mt-1">{m.role==='agent'?'Agent':'KI'}</div>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} className="flex-1 border rounded p-2" placeholder="Nachricht tippen und Enter" />
          <button onClick={send} className="px-3 py-2 rounded-xl bg-black text-white">Senden</button>
        </div>
      </div>
    </main>
  );
}
