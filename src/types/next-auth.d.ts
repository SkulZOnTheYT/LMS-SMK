import type { UserRole } from "@/app/generated/prisma/client"
import "next-auth"

declare module "next-auth" {
  interface User {
    role?: UserRole
  }

  interface Session {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: UserRole
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole
  }
}