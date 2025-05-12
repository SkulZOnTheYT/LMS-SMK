import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/app/prisma"

// Define UserRole type
type UserRole = "TKJ1" | "TKJ2" | "TKJ3" | "INSTRUCTOR";

import Navbar from "@/components/navbar"
import StudentsListClient from "@/components/studentsListClient"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function StudentsPage() {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect("/login")
  }

  // Fetch user data to check permissions
  const user = await prisma.user.findUnique({
    where: { email: session.user.email ?? undefined },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  if (!user) {
    redirect("/login")
  }
  
  // Fetch all instructors
  const instructors = await prisma.user.findMany({
    where: {
      role: "INSTRUCTOR",
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Format instructors for UI
  const formattedInstructors = instructors.map((instructor) => ({
    id: instructor.id,
    name: instructor.name || "Unnamed Instructor",
    email: instructor.email || "",
    image: instructor.image || "",
  }))

  // Fetch students by classes (TKJ1, TKJ2, TKJ3)
  const classGroups = ["TKJ1", "TKJ2", "TKJ3"]
  const studentsByClass: Record<string, Array<{ id: string; name: string; email: string; image: string; role: string }>> = {}

  for (const classGroup of classGroups) {
    const students = await prisma.user.findMany({
      where: {
        role: classGroup as UserRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    // Format students for UI
    studentsByClass[classGroup] = students.map((student) => ({
      id: student.id,
      name: student.name || "Unnamed Student",
      email: student.email || "",
      image: student.image || "",
      role: student.role || "",
    }))
  }

  return (
    <Navbar>
      <Suspense fallback={<StudentsPageSkeleton />}>
        <StudentsListClient 
          user={user}
          instructors={formattedInstructors}
          studentsByClass={studentsByClass}
        />
      </Suspense>
    </Navbar>
  )
}

function StudentsPageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>

      {/* Instructors section skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-[150px] mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[60px] w-full rounded-lg" />
          ))}
        </div>
      </Card>

      {/* Students sections skeletons */}
      {[1, 2, 3].map((section) => (
        <Card key={section} className="p-6">
          <Skeleton className="h-6 w-[150px] mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[60px] w-full rounded-lg" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}