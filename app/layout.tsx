import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: "(function(){function done(){document.body.classList.add('fonts-loaded')}if(document.fonts&&document.fonts.ready){document.fonts.ready.then(done).catch(done);}else{done();}})();" }} />
      </head>
      <body
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen overflow-x-hidden"
        suppressHydrationWarning
        style={{ scrollBehavior: 'smooth' }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
