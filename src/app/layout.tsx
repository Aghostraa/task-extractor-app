import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from 'react';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap',
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Extract and manage tasks from text",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          min-h-full 
          flex 
          flex-col 
          dark
          touch-scrolling
        `}
        suppressHydrationWarning
      >
        <Suspense>
          {children}
        </Suspense>
      </body>
    </html>
  );
}