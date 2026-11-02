import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRAGON IA — Enterprise Intelligence",
  description: "Plateforme d'agents IA pour les entreprises.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
