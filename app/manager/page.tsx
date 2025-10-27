"use client";
import { useMemo } from "react";

export default function Page(){
  const sessions = useMemo(()=>{
    if(typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("ai-call-coach-sessions") || "[]");
  },[]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow p-4">
        <h1 className="text-xl font-semibold mb-4">Manager Dashboard</h1>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b">
            <th className="py-2 pr-4">Datum</th>
            <th className="py-2 pr-4">Szenario</th>
            <th className="py-2 pr-4">Turns</th>
            <th className="py-2 pr-4">Score</th>
            <th className="py-2 pr-4">Staerken</th>
            <th className="py-2 pr-4">Verbessern</th>
          </tr></thead>
          <tbody>
            {sessions.slice().reverse().map((s:any, idx:number)=>{
              const e = s.eval || {};
              return (
                <tr key={idx} className="border-b align-top">
                  <td className="py-2 pr-4">{new Date(s.ts||Date.now()).toLocaleString()}</td>
                  <td className="py-2 pr-4 uppercase">{s.scenario}</td>
                  <td className="py-2 pr-4">{(s.messages||[]).length}</td>
                  <td className="py-2 pr-4">{e.score ?? "-"}</td>
                  <td className="py-2 pr-4">{(e.strengths||[]).join(", ")}</td>
                  <td className="py-2 pr-4">{(e.improves||[]).join(", ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
