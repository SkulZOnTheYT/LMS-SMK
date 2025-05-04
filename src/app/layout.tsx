import { Providers } from "@/components/providers";
import "./globals.css";
import type { ReactNode } from "react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LMS Teknik Komputer Jaringan",
  description: "Learning Management System untuk Teknik Komputer Jaringan",
};

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}