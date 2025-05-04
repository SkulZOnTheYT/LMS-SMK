"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardListIcon,
  CalendarIcon,
  MessageSquareIcon,
  UsersIcon,
  FileTextIcon,
  GraduationCapIcon,
  BarChartIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/prisma/app/generated/prisma/client"

interface SidebarProps {
  isOpen: boolean
  role: UserRole
}

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export default function Sidebar({ isOpen, role = "VISITOR" }: SidebarProps) {
  const pathname = usePathname()

  // Get menu items based on role
  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [
      { name: "Dashboard", href: "/", icon: HomeIcon },
      { name: "Mata Pelajaran", href: "/courses", icon: BookOpenIcon },
      { name: "Tugas", href: "/assignments", icon: ClipboardListIcon },
      { name: "Jadwal", href: "/calendar", icon: CalendarIcon },
      { name: "Diskusi", href: "/discussions", icon: MessageSquareIcon },
    ]

    const tkj1Items: MenuItem[] = [{ name: "Praktikum Dasar", href: "/practicals/basic", icon: GraduationCapIcon }]

    const tkj2Items: MenuItem[] = [
      { name: "Praktikum Lanjutan", href: "/practicals/advanced", icon: GraduationCapIcon },
      { name: "Projek Kelompok", href: "/projects", icon: UsersIcon },
    ]

    const tkj3Items: MenuItem[] = [
      { name: "Prakerin", href: "/internship", icon: GraduationCapIcon },
      { name: "Projek Akhir", href: "/final-project", icon: FileTextIcon },
      { name: "Sertifikasi", href: "/certifications", icon: BarChartIcon },
    ]

    // Return items based on role
    switch (role) {
      case "TKJ1":
        return [...commonItems, ...tkj1Items]
      case "TKJ2":
        return [...commonItems, ...tkj2Items]
      case "TKJ3":
        return [...commonItems, ...tkj3Items]
      default:
        return commonItems
    }
  }

  const menuItems = getMenuItems()

  // Check if link is active
  const isActiveLink = (href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-primary overflow-y-auto lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-center h-16 px-6 bg-primary-foreground/10">
        <div className="text-xl font-bold text-primary-foreground">
          <span className="hidden lg:inline">TKJ Learning System</span>
          <span className="lg:hidden">TKJ</span>
        </div>
      </div>

      <div className="mt-2">
        <div className="px-6 py-3">
          <div className="text-xs uppercase font-semibold text-primary-foreground/70 tracking-wider">Menu</div>
        </div>

        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  isActiveLink(item.href)
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="px-6 py-3 mt-6">
        <div className="text-xs uppercase font-semibold text-primary-foreground/70 tracking-wider">
          {role} - Menu Khusus
        </div>
      </div>

      {/* Konten spesifik per-role */}
      {role === "TKJ1" && (
        <div className="px-3">
          <Link
            href="/resources/beginner"
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
              isActiveLink("/resources/beginner")
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
            )}
          >
            <FileTextIcon className="mr-3 h-5 w-5" />
            Materi Pemula
          </Link>
        </div>
      )}

      {role === "TKJ2" && (
        <div className="px-3">
          <Link
            href="/resources/intermediate"
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
              isActiveLink("/resources/intermediate")
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
            )}
          >
            <FileTextIcon className="mr-3 h-5 w-5" />
            Materi Menengah
          </Link>
        </div>
      )}

      {role === "TKJ3" && (
        <div className="px-3">
          <Link
            href="/career"
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
              isActiveLink("/career")
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
            )}
          >
            <GraduationCapIcon className="mr-3 h-5 w-5" />
            Persiapan Karir
          </Link>
        </div>
      )}
    </div>
  )
}
