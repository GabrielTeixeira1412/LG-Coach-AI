export default function Page(){
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <section className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-2">AI Call Coach - Demo</h1>
        <p className="text-gray-600">Trainiert Kaltakquise, Discovery, Einwandbehandlung, Abschluss, Cross-/Upselling. Sprache oder Text. Sofortige Auswertung.</p>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {k:"Discovery-Tiefe", v:">= 3 Fragen"},
          {k:"Nutzen-Kopplung", v:">= 2 KPI"},
          {k:"Next Step Quote", v:">= 1 Termin"}
        ].map((m,i)=>(
          <div key={i} className="bg-white p-4 rounded-2xl shadow">
            <div className="text-sm text-gray-500">{m.k}</div>
            <div className="text-xl font-semibold">{m.v}</div>
          </div>
        ))}
      </section>
      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold mb-2">So wird gemessen</h2>
        <ul className="list-disc ml-5 text-sm space-y-1">
          <li>Discovery-Signale: bedarf, ziel, problem, stakeholder...</li>
          <li>Nutzen/KPI: ROI, Zeit sparen, Kosten senken...</li>
          <li>Einwand-Handling: Spiegeln, Verengen, Next Step</li>
          <li>Balance: Redeanteil Agent ca. 55 Prozent</li>
        </ul>
      </section>
      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold mb-2">Live testen</h2>
        <p>Starte den <a className="underline" href="/simulator">Simulator</a> und nutze anschliessend das <a className="underline" href="/manager">Manager Dashboard</a>.</p>
      </section>
    </main>
  );
}
