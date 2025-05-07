import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/app/prisma"
import type { Assignment, Course, Submission as PrismaSubmission } from '@/prisma/app/generated/prisma/client'
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  Book,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react"

export default async function AssignmentsPage() {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect("/login")
  }

  // Fetch user data
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
    } else if (user.role !== "INSTRUCTOR") {
        redirect("/?toast=unauthorized_access")
      }

  // Get all assignments for the user's courses
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
    include: {
      course: {
        select: {
          id: true,
          name: true,
        },
      },
      submissions: {
        where: {
          studentId: user.id,
        },
        select: {
          id: true,
          submittedAt: true,
          grade: true,
          feedback: true,
        },
      },
    },
    orderBy: [
      { dueDate: "asc" },
    ],
  })

  // Process assignments into categories
  const currentDate = new Date()
  
  const pendingAssignments = assignments.filter(assignment => {
    return (
      (!assignment.submissions || assignment.submissions.length === 0) && 
      (assignment.dueDate ? new Date(assignment.dueDate) > currentDate : true)
    )
  })

  const overdueAssignments = assignments.filter(assignment => {
    return (
      (!assignment.submissions || assignment.submissions.length === 0) && 
      (assignment.dueDate ? new Date(assignment.dueDate) <= currentDate : false)
    )
  })

  const submittedAssignments = assignments.filter(assignment => {
    return assignment.submissions && assignment.submissions.length > 0
  })

  // Get stats
  const stats = {
    total: assignments.length,
    pending: pendingAssignments.length,
    overdue: overdueAssignments.length,
    submitted: submittedAssignments.length,
    graded: submittedAssignments.filter(a => a.submissions[0]?.grade !== null).length
  }

  return (
    <Navbar>
      <Suspense fallback={<AssignmentsSkeleton />}>
        <div className="container py-6 space-y-6 ml-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tugas {user.role}</h1>
              <p className="text-muted-foreground">
                Kelola dan pantau tugas untuk program {user.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tugas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menunggu Dikerjakan</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdue}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sudah Dinilai</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.graded}/{stats.submitted}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Menunggu ({stats.pending})</TabsTrigger>
              <TabsTrigger value="overdue">Terlambat ({stats.overdue})</TabsTrigger>
              <TabsTrigger value="submitted">Terkumpul ({stats.submitted})</TabsTrigger>
              <TabsTrigger value="all">Semua ({stats.total})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-4">
              <div className="grid gap-4">
                {pendingAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <CheckCircle2 className="h-10 w-10 text-green-500 mb-4" />
                      <p className="text-lg font-medium text-center">Tidak ada tugas yang menunggu</p>
                      <p className="text-sm text-muted-foreground text-center">
                        Semua tugas sudah dikerjakan
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingAssignments.map((assignment) => (
                    <AssignmentCard 
                      key={assignment.id}
                      assignment={assignment}
                      status="pending"
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="overdue" className="mt-4">
              <div className="grid gap-4">
                {overdueAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <CheckCircle2 className="h-10 w-10 text-green-500 mb-4" />
                      <p className="text-lg font-medium text-center">Tidak ada tugas yang terlambat</p>
                      <p className="text-sm text-muted-foreground text-center">
                        Semua tugas sudah dikerjakan tepat waktu
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  overdueAssignments.map((assignment) => (
                    <AssignmentCard 
                      key={assignment.id}
                      assignment={assignment}
                      status="overdue"
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="submitted" className="mt-4">
              <div className="grid gap-4">
                {submittedAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-center">Belum ada tugas yang dikumpulkan</p>
                      <p className="text-sm text-muted-foreground text-center">
                        Kerjakan tugas dan kumpulkan untuk melihat hasilnya di sini
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  submittedAssignments.map((assignment) => (
                    <AssignmentCard 
                      key={assignment.id}
                      assignment={assignment}
                      status="submitted"
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4">
                {assignments.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <Book className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-center">Belum ada tugas</p>
                      <p className="text-sm text-muted-foreground text-center">
                        Belum ada tugas yang tersedia untuk program {user.role}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                    assignments.map((assignment) => {
                        let status: AssignmentStatus = "pending";
                        if (
                          assignment.submissions &&
                          assignment.submissions.length > 0
                        ) {
                          status = "submitted";
                        } else if (
                          assignment.dueDate &&
                          new Date(assignment.dueDate) <= currentDate
                        ) {
                          status = "overdue";
                        }
                    
                    return (
                      <AssignmentCard 
                        key={assignment.id}
                        assignment={assignment}
                        status={status}
                      />
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </Navbar>
  )
}

interface ExtendedAssignment extends Assignment {
  course: Pick<Course, "id" | "name">; // Hanya id dan name dari course
  submissions: Pick<PrismaSubmission, "id" | "submittedAt" | "grade" | "feedback">[]; // Array dari submission
}

type AssignmentStatus = "pending" | "overdue" | "submitted";

interface AssignmentCardProps {
    assignment: ExtendedAssignment; // Sebaiknya ganti 'any' dengan tipe Assignment yang sesuai dari Prisma
    status: AssignmentStatus;
  }

function AssignmentCard({ assignment, status }: AssignmentCardProps) {
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const submission = assignment.submissions && assignment.submissions.length > 0 
    ? assignment.submissions[0] 
    : null;

  // Calculate time remaining or overdue
  let timeText = "Tidak ada batas waktu";
  let timeColor = "text-muted-foreground";

  let badgeVariant: "default" | "destructive" | "outline" | "secondary" = "outline";
  if (status === "overdue") {
    badgeVariant = "destructive";
  } else if (status === "submitted") {
    badgeVariant = "default"; // Atau bisa juga "secondary" sesuai preferensi Anda
  }
  
  if (dueDate) {
    if (status === "submitted") {
      // --- TAMBAHKAN PENGECEKAN INI ---
      if (submission) {
        timeText = `Dikumpulkan: ${formatDistanceToNow(new Date(submission.submittedAt), { // Sekarang aman
          addSuffix: true,
          locale: id,
        })}`;
        timeColor = "text-green-600"; // Jangan lupa set timeColor juga
      } else {
        // Fallback jika status "submitted" tapi objek submission tidak ada (seharusnya jarang terjadi jika logika status konsisten)
        timeText = "Data pengumpulan tidak ditemukan";
        timeColor = "text-red-500"; // Atau warna default
        console.warn(`Status tugas adalah 'submitted' tetapi objek submission null untuk ID Tugas: ${assignment.id}`);
      }
      // --- AKHIR PENGECEKAN ---
    } else if (status === "overdue") {
      timeText = `Terlambat: ${formatDistanceToNow(dueDate, {
        addSuffix: true,
        locale: id,
      })}`;
      timeColor = "text-red-600";
    } else if (status === "pending") { // Lebih baik eksplisit untuk 'pending'
      timeText = `Tenggat: ${formatDistanceToNow(dueDate, {
        addSuffix: true,
        locale: id,
      })}`;
      timeColor = "text-amber-600";
    }
  } else if (status === "submitted" && submission) {
    // Kasus jika tidak ada dueDate, tapi sudah dikumpulkan
    // Ini mungkin perlu Anda sesuaikan, tapi contoh untuk menangani submission.submittedAt
    timeText = `Dikumpulkan: ${formatDistanceToNow(new Date(submission.submittedAt), {
      addSuffix: true,
      locale: id,
    })}`;
    timeColor = "text-green-600";
  }


  return (
    <Card className={`
      ${status === "overdue" ? "border-red-200 bg-red-50" : ""}
      ${status === "submitted" ? "border-green-200 bg-green-50" : ""}
    `}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <Badge variant={badgeVariant}>
              {status === "pending"
                ? "Menunggu"
                : status === "overdue"
                ? "Terlambat"
                : "Terkumpul"}
            </Badge>
            <Badge variant="outline" className="bg-background">
              {assignment.course.name}
            </Badge>
          </div>
          
          {submission && typeof submission.grade === 'number' && (
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              Nilai: {submission.grade}
            </Badge>
          )}
        </div>
        
        <CardTitle>{assignment.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {assignment.description || "Tidak ada deskripsi untuk tugas ini."}
        </CardDescription>
      </CardHeader>
      
      <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className={timeColor}>{timeText}</span>
        </div>
        
        <Button 
          variant={status === "submitted" ? "outline" : "default"}
          className={status === "submitted" ? "border-green-500 text-green-700" : ""}
        >
          {status === "submitted" ? "Lihat Pengumpulan" : "Kerjakan Tugas"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function AssignmentsSkeleton() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-[180px]" />
          <Skeleton className="h-4 w-[250px] mt-2" />
        </div>
        
        <Skeleton className="h-9 w-[200px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Skeleton className="h-10 w-full mb-4" />
        
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-6 w-[120px]" />
                  </div>
                </div>
                
                <Skeleton className="h-6 w-[70%] mt-3" />
                <Skeleton className="h-4 w-[90%] mt-2" />
              </CardHeader>
              
              <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-10 w-[150px]" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}