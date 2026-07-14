import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import T from "@/components/T";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://explora-cr.vercel.app"),
  title: {
    default: "Explora Costa Rica",
    template: "%s · Explora Costa Rica",
  },
  description:
    "Mapa interactivo de las 7 provincias, 84 cantones y 494 distritos de Costa Rica.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the pre-paint script sets data-theme on
    // <html> before React hydrates — an expected, deliberate mismatch.
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-lienzo text-tinta antialiased">
        <Header />
        {/* md:pb-14 reserves room for the fixed footer so it never covers
            the last bit of content on desktop. */}
        <main className="mx-auto max-w-5xl px-6 pb-10 pt-10 md:pb-14">
          {children}
        </main>
        <footer className="border-t border-borde bg-lienzo px-6 py-2.5 text-center text-xs text-suave md:fixed md:inset-x-0 md:bottom-0 md:z-30">
          <T k="footer.texto" />
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
