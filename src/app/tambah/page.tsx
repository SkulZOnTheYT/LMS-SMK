import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/app/prisma"

import Navbar from "@/components/navbar"
import CreateContentPage from "@/components/content"

async function getCoursesForSelection() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,   // Ini adalah CUID
      name: true,
      // courseCode: true, // Jika Anda ingin menampilkan kode kelas juga
    },
    orderBy: {
      name: 'asc', // Urutkan berdasarkan nama
    },
  });
  return courses;
}

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

  const courses = await getCoursesForSelection();

  return (
    <Navbar>
      <CreateContentPage courses={courses} />
    </Navbar>
  )
}