import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitto - きっといつか役に立つ。",
  description: "ちょっと便利で、ちょっと面白い。そんなツールをゆるく集めました。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
