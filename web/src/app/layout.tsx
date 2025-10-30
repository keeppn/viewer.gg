import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viewer.gg - Tournament Management Platform",
  description: "Manage your esports tournaments and applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
