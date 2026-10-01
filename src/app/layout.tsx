import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFC Review Card Platform",
  description: "Phase 2 NFC Review Card Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}