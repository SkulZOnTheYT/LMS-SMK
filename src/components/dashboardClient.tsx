"use client"
import Link from "next/link"
import type { UserRole } from "@/prisma/app/generated/prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CourseCard from "@/components/courseCard"
import AnnouncementCard from "@/components/announcementCard"
import UpcomingAssignment from "@/components/upcomingAssigment"

interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole
}

interface Course {
  id: string
  title: string
  instructor: string
  progress: number
  description?: string
}

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string | null
  isSubmitted: boolean
}

interface Announcement {
  id: string
  title: string
  content: string
  author: string | null
  date: string
}

interface DashboardClientProps {
  user: User
  courses: Course[]
  assignments: Assignment[]
  announcements: Announcement[]
}

export default function DashboardClient({ user, courses, assignments, announcements }: DashboardClientProps) {

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case "TKJ1":
        return "Kelas XII TKJ 1 - SMKN 1 Raman Utara"
      case "TKJ2":
        return "Kelas XII TKJ 2 - SMKN 1 Raman Utara"
      case "TKJ3":
        return "Kelas XII TKJ 3 - SMKN 1 Raman Utara"
      case "INSTRUCTOR":
        return "Guru - SMKN 1 Raman Utara"
      default:
        return "Pengunjung Website LMS SMKN 1 Raman Utara"
    }
  }

  return (
    <div className="p-4 md:p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Selamat datang, {user.name || "Pengguna"}! 👋</h1>
        <p className="text-muted-foreground mt-1">{getRoleDisplay(user.role)}</p>
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Course Cards */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Mata Pelajaran</CardTitle>
              <Link href="/courses" className="text-primary text-sm font-medium hover:underline">
                Lihat Semua
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {courses.length > 0 ? (
                  courses.map((course) => <CourseCard key={course.id} course={course} />)
                ) : (
                  <p className="col-span-full text-center py-4 text-muted-foreground">Belum ada mata pelajaran</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Pengumuman</CardTitle>
              <Link href="/announcements" className="text-primary text-sm font-medium hover:underline">
                Lihat Semua
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Belum ada pengumuman</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upcoming & Progress */}
        <div className="space-y-6">
          {/* Upcoming Assignments */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Tugas Mendatang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => <UpcomingAssignment key={assignment.id} assignment={assignment} />)
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Tidak ada tugas mendatang</p>
                )}
              </div>

              <div className="mt-4">
                <Link href="/assignments" className="text-primary text-sm font-medium hover:underline">
                  Lihat Semua Tugas
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Calendar / Schedule */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Jadwal Mendatang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
                  <div className="flex items-start">
                    <div className="bg-primary/10 text-primary rounded p-2 mr-3">
                      <span className="block text-center font-bold">10</span>
                      <span className="text-xs">Okt</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Workshop Jaringan Komputer</h3>
                      <p className="text-sm text-muted-foreground">09:00 - 12:00</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-md border border-green-100">
                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded p-2 mr-3">
                      <span className="block text-center font-bold">15</span>
                      <span className="text-xs">Okt</span>
                    </div>
                    <div>
                      <h3 className="font-medium">UTS Semester Ganjil</h3>
                      <p className="text-sm text-muted-foreground">Hari pertama</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Link href="/calendar" className="text-primary text-sm font-medium hover:underline">
                  Lihat Jadwal Lengkap
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}