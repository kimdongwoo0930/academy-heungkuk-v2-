import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const pretendard = localFont({
  src: [
    { path: "../public/fonts/Pretendard-Thin.subset.woff2", weight: "100" },
    { path: "../public/fonts/Pretendard-ExtraLight.subset.woff2", weight: "200" },
    { path: "../public/fonts/Pretendard-Light.subset.woff2", weight: "300" },
    { path: "../public/fonts/Pretendard-Regular.subset.woff2", weight: "400" },
    { path: "../public/fonts/Pretendard-Medium.subset.woff2", weight: "500" },
    { path: "../public/fonts/Pretendard-SemiBold.subset.woff2", weight: "600" },
    { path: "../public/fonts/Pretendard-Bold.subset.woff2", weight: "700" },
    { path: "../public/fonts/Pretendard-ExtraBold.subset.woff2", weight: "800" },
    { path: "../public/fonts/Pretendard-Black.subset.woff2", weight: "900" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "흥국생명 연수원 관리 시스템",
  description: "흥국생명 연수원 내부 관리 시스템",
};

const themeBootScript = `
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={pretendard.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
