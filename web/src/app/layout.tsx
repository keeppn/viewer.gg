import type { Metadata } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"]
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-body"
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Viewer.gg - Ultra High-Tech Esports Platform",
  description: "Next-generation tournament management platform with cutting-edge cyberpunk design",
};

// Disable caching for the entire app
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="antialiased font-[family-name:var(--font-body)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
