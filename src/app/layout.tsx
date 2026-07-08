import type { Metadata } from "next";
import "./globals.css";
import { AppDataProvider } from "@/context/AppDataContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

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
      <body>
        <AppDataProvider>
          <AuthProvider>
            <div className="min-h-screen">
              <Header />
              <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
            </div>
          </AuthProvider>
        </AppDataProvider>
      </body>
    </html>
  );
}
