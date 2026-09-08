import type { Metadata } from "next";
import { Nanum_Myeongjo, Noto_Sans_KR, Geist_Mono } from "next/font/google";
import { poll } from "@/poll.config";
import "./globals.css";

const display = Nanum_Myeongjo({
  variable: "--font-display",
  weight: ["700", "800"],
  subsets: ["latin"],
});

const body = Noto_Sans_KR({
  variable: "--font-body",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: poll.title,
  description: poll.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
