import { Providers } from "@/components/providers";
import "./globals.css";
import type { ReactNode } from "react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "LMS SMKN 1 Raman Utara | %s",
    default: "LMS SMKN 1 Raman Utara",
  },
  description: "Learning Management System untuk siswa dan guru SMKN 1 Raman Utara",
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