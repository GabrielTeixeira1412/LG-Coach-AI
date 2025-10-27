import Link from "next/link";

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-6 grid gap-6 md:grid-cols-3">
      <section className="bg-white p-6 rounded-2xl shadow md:col-span-2">
        <h1 className="text-2xl font-bold mb-2">Trainiere Kaltakquise, Discovery, Einwand, Abschluss, Cross-Selling</h1>
        <p className="text-sm text-gray-600 mb-4">KI-Personas. Sprache oder Text. Sofortiges Feedback.</p>
        <div className="flex gap-3">
          <Link href="/simulator" className="bg-black text-white px-4 py-2 rounded-xl">Starten</Link>
          <Link href="/manager" className="border px-4 py-2 rounded-xl">Manager</Link>
        </div>
      </section>
      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold mb-2">Szenarien</h2>
        <ul className="list-disc ml-4 text-sm">
          <li>Kaltakquise Druck</li>
          <li>Bedarfsanalyse</li>
          <li>Einwandbehandlung</li>
          <li>Abschluss</li>
          <li>Cross- und Upselling</li>
        </ul>
      </section>
    </main>
  );
}
