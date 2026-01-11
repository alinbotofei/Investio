import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investio",
  description: "Investment Assistant - AI-powered financial insights",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen"
        suppressHydrationWarning
      >
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
        />
        {children}
      </body>
    </html>
  );
}
