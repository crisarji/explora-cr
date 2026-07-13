import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Explora Costa Rica",
  description:
    "Mapa interactivo de las 7 provincias, 84 cantones y distritos de Costa Rica.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <header className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between">
            <Link href="/" className="text-lg font-medium">
              Explora Costa Rica
            </Link>
            <Link
              href="/acerca"
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              Acerca
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="border-t border-neutral-200 px-6 py-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          Proyecto de servicio social · datos abiertos
        </footer>
      </body>
    </html>
  );
}
