// ... oben unveraendert
const QUICK: Record<string,string[]> = {
  cold: ["Guten Tag Herr Becker, darf ich in 20 Sekunden sagen, warum ich anrufe?", "Wenn es passt, sichern wir einen 15-Min Slot diese Woche."],
  discovery: ["Welche 2 KPIs sind fuer Sie Q4 am wichtigsten?", "Wie messen Sie Erfolg in diesem Bereich heute?"],
  objection: ["Angenommen der ROI passt: was waere Ihr naechster Schritt?", "Welche Bedingung muesste erfuellt sein, damit der Preis ok ist?"],
  closing: ["Lassen Sie uns Dienstag 10:00 ansetzen. Passt das?", "Wenn nein, welcher Slot diese Woche ist realistisch?"],
  cross: ["Nutzen Sie Feature X bereits im Team?", "Welches Team profitiert zuerst, Vertrieb oder Support?"]
};

export default function Page(){
  // ... state wie gehabt

  // UI unten im return austauschen:
  return (
    <main className="max-w-6xl mx-auto p-6 grid gap-4 md:grid-cols-3">
      <div className="bg-white p-4 rounded-2xl shadow space-y-3">
        <h2 className="font-semibold">Setup</h2>
        <label className="block text-sm">Szenario</label>
        <select value={scenario} onChange={e=>setScenario(e.target.value)} disabled={running} className="w-full border rounded p-2">
          {["cold","discovery","objection","closing","cross"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        {!running
          ? <button onClick={start} className="px-3 py-2 rounded-xl bg-green-600 text-white w-full">Start</button>
          : <button onClick={stop} className="px-3 py-2 rounded-xl bg-red-600 text-white w-full">Stop & Auswerten</button>}
        <div className="text-xs text-gray-600">
          Leitfaden: stelle 3 Discovery-Fragen, verknuepfe 2 Nutzen mit KPI, sichere Next Step.
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
