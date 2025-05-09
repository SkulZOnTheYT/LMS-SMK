import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/app/prisma"

import Navbar from "@/components/navbar"
import CreateContentPage from "@/components/content"

export default async function CreatePage() {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect("/login")
  }

  // Fetch user to check if they have INSTRUCTOR role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email ?? undefined },
    select: {
      id: true,
      role: true,
    },
  })

  // Only INSTRUCTOR role can access this page
  if (!user || user.role !== "INSTRUCTOR") {
    redirect("/?toast=unauthorized_access")
  }

  // Fetch available courses for this instructor
  const courses = await prisma.course.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
          role: "INSTRUCTOR",
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  return (
    <Navbar>
      <CreateContentPage courses={courses} />
    </Navbar>
  )
}