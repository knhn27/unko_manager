import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "うんこ管理アプリ - 健康管理のための排便記録",
  description:
    "日々の排便状況を記録し、健康管理をサポートするアプリケーションです。カレンダー機能と健康分析機能を備えています。",
  keywords: "健康管理, 排便記録, カレンダー, 健康アプリ",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💩</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="うんこ管理アプリ" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
