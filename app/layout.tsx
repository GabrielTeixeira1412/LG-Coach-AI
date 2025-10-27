import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Call Coach",
  description: "Training fuer Beratung und Vertrieb"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50">
        <header className="flex items-center justify-between p-5">
          <Link href="/" className="text-xl font-bold">AI CALL COACH</Link>
          <nav className="flex gap-4">
            <Link href="/simulator">Simulator</Link>
            <Link href="/manager">Manager</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
