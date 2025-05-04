import { Suspense } from "react"
import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/app/prisma"

import DashboardClient from "@/components/dashboardClient"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


export default async function DashboardPage() {
  const session = await auth()

  if (!session|| !session.user || !session.user.id) {
    redirect("/login")
  }

  // Fetch user data with courses, assignments, and announcements
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  // Fetch courses for the user's role
  const courses = await prisma.course.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      members: {
        where: {
          role: "INSTRUCTOR",
        },
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    take: 6,
  })

  // Format courses for the UI
  const formattedCourses = courses.map((course) => ({
    id: course.id,
    title: course.name,
    instructor: course.members[0]?.user.name || "Tidak ada instruktur",
    progress: 0, // You'll need to calculate this based on user progress
    description: course.description || "",
  }))

  // Fetch assignments
  const assignments = await prisma.assignment.findMany({
    where: {
      course: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      course: {
        select: {
          name: true,
        },
      },
      submissions: {
        where: {
          studentId: user.id,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 5,
  })

  // Format assignments for the UI
  const formattedAssignments = assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    course: assignment.course.name,
    dueDate: assignment.dueDate ? assignment.dueDate.toISOString().split("T")[0] : null,
    isSubmitted: assignment.submissions.length > 0,
  }))

  // Fetch announcements
  const announcements = await prisma.post.findMany({
    where: {
      course: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 2,
  })

  // Format announcements for the UI
  const formattedAnnouncements = announcements.map((announcement) => ({
    id: announcement.id,
    title: announcement.title || "Pengumuman",
    content: announcement.content,
    author: announcement.author.name || null,
    date: announcement.createdAt.toISOString().split("T")[0],
  }))

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient
        user={user}
        courses={formattedCourses}
        assignments={formattedAssignments}
        announcements={formattedAnnouncements}
      />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-[150px] mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-[150px] mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-[100px] w-full rounded-lg" />
              <Skeleton className="h-[100px] w-full rounded-lg" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-[150px] mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-[60px] w-full rounded-lg" />
              <Skeleton className="h-[60px] w-full rounded-lg" />
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-[150px] mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-[80px] w-full rounded-lg" />
              <Skeleton className="h-[80px] w-full rounded-lg" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
