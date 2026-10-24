
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicaAI",
  description: "Simulateur de cas cliniques pour étudiants en médecine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
