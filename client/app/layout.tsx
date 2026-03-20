import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "흥국생명 연수원 관리 시스템",
  description: "흥국생명 연수원 내부 관리 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
