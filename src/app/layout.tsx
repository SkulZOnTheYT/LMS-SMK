import { Providers } from "@/components/providers";
import AuthNotifier from "@/components/aksesGuru";
import "./globals.css";
import { Suspense } from "react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "LMS SMKN 1 Raman Utara | %s",
    default: "LMS SMKN 1 Raman Utara",
  },
  description: "Learning Management System untuk siswa dan guru SMKN 1 Raman Utara",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
        <Suspense fallback={<div>Loading notifier...</div>}>
          <AuthNotifier />
        </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  )
}