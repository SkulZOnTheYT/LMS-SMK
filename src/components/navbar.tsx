"use client"

import type React from "react"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import {
  Bell,
  ChevronDown,
  MenuIcon,
  Search,
  HomeIcon,
  NewspaperIcon,
  ClipboardListIcon,
  CalendarIcon,
  MessageSquareMoreIcon,
  UsersIcon,
  FileTextIcon,
  GraduationCapIcon,
  BarChartIcon,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import Image from "next/image"
import type { UserRole } from "@/prisma/app/generated/prisma/client"

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Get user name and role from session
  const userName = session?.user?.name || "User"
  const userRole = session?.user?.role || ("VISITOR" as UserRole)

  // Get menu items based on role
  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [
      { name: "Dashboard", href: "/", icon: HomeIcon },
      { name: "Pengumuman", href: "/pengumuman", icon: NewspaperIcon },
      { name: "Tugas", href: "/tugas", icon: ClipboardListIcon },
      { name: "Jadwal", href: "/jadwal", icon: CalendarIcon },
      { name: "Diskusi", href: "/diskusi", icon: MessageSquareMoreIcon },
      { name: "Daftar Siswa", href: "/siswa", icon: GraduationCapIcon }
    ]
    return commonItems
  }

  const menuItems = getMenuItems()

  // Check if link is active
  const isActiveLink = (href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="bg-background shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-secondary">
                <SheetHeader className="flex items-center justify-center h-16 px-6 bg-primary-foreground/10">
                  <SheetTitle className="text-xl font-bold text-black">
                    <span>LMS SMKN1 RU</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-2">
                  <div className="px-6 py-3">
                    <div className="text-xs uppercase font-semibold text-black tracking-wider">
                      Menu
                    </div>
                  </div>

                  <nav className="px-3 space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                            isActiveLink(item.href)
                              ? "bg-black/20 text-black"
                              : "text-black/80 hover:bg-black hover:text-primary-foreground",
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
                  <div className="text-xs uppercase font-semibold text-black/70 tracking-wider">
                    Menu Khusus - {userRole}
                  </div>
                </div>

                {/* Konten spesifik per-role */}
                {userRole === "INSTRUCTOR" && (
                  <div className="px-3">
                    <Link
                      href="/tugas/nilai"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                        isActiveLink("/resources/beginner")
                          ? "bg-black/20 text-black"
                          : "text-black/80 hover:bg-black hover:text-primary-foreground",
                      )}
                    >
                      <FileTextIcon className="mr-3 h-5 w-5" />
                      Daftar Tugas
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="ml-4 md:ml-0">
              <Link href="/" className="flex items-center">
                <span className="text-primary font-bold text-xl">LMS</span>
                <span className="text-muted-foreground font-bold text-xl ml-2">SMKN 1 RU</span>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:block flex-1 px-4 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Cari materi, tugas, atau pengumuman..." />
            </div>
          </div>

          {/* Right items */}
          <div className="flex items-center">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User Dropdown */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-2 flex items-center gap-2 p-1 px-2 h-auto">
                    <Image
                      src={session.user?.image || "/default-avatar.png"}
                      alt="User Avatar"
                      width={25}
                      height={25}
                      className="bg-primary/20 text-primary rounded-full"
                    />
                    <div className="ml-1 hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-muted-foreground">{userRole}</span>
                    </div>
                    <ChevronDown className="hidden md:block ml-1 h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profil Saya</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Pengaturan</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>Keluar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search (visible on smaller screens) */}
      <div className="px-4 py-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Cari materi, tugas, dan lainnya..." />
        </div>
      </div>
    </nav>
  )
}
