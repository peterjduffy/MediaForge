import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "MediaForge — Create on-brand illustrations that feel unmistakably yours",
  description: "Create on-brand illustrations that feel unmistakably yours. Generate consistent visuals in seconds for blogs, social, marketing pages, product UI and docs.",
  keywords: "AI illustrations, vector graphics, SVG, EPS, PDF, design tools, artificial intelligence, brand consistency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
