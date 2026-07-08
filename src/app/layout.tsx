import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "塾管理システム | 時間割・指導カルテ・給与管理",
  description: "授業時間割、生徒の指導カルテ、講師の給与管理を行う塾向け管理アプリ",
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
