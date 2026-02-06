import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/languageContext";

export const metadata: Metadata = {
  title: "VB Spine",
  description: "Product selection for VB Spine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
