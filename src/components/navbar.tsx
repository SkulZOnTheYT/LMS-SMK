"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Bell, ChevronDown, MenuIcon, Search } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { UserRole } from "@/prisma/app/generated/prisma/client"

interface NavbarProps {
  toggleSidebar: () => void
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { data: session } = useSession()

  // Get user name and role from session
  const userName = session?.user?.name || "User"
  const userRole = session?.user?.role || ("VISITOR" as UserRole)

  return (
    <nav className="bg-background shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>

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
                    <Image src={session.user?.image || "/default-avatar.png"} alt="User Avatar" width={25} height={25} className="bg-primary/20 text-primary rounded-full" />
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
