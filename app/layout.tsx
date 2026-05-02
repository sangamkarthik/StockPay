import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans, Noto_Serif } from "next/font/google";
import { IngredientsProvider } from "./context/ingredients-context";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Recipe Remix",
  description: "Remix delicious recipes with what you already have.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${geistMono.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <IngredientsProvider>{children}</IngredientsProvider>
      </body>
    </html>
  );
}
