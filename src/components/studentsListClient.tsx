"use client"

import { useState } from "react"
import { MoreHorizontal, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type User = {
  id: string
  name: string | null
  email: string | null
  role: string
}

type Student = {
  id: string
  name: string
  email: string
  image: string
  role: string
}

type Instructor = {
  id: string
  name: string
  email: string
  image: string
}

type StudentsListClientProps = {
  user: User
  instructors: Instructor[]
  studentsByClass: {
    [className: string]: Student[]
  }
}

export default function StudentsListClient({ instructors, studentsByClass }: StudentsListClientProps) {
  const [searchQuery] = useState("")
  
  // Filter function for students and instructors
const filterByName = (person: { name: string | null; email: string | null }): boolean => {
    if (!searchQuery) return true
    return (person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) || 
           (person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
}

  // Filter all data based on search query
  const filteredInstructors = instructors.filter(filterByName)
  const filteredStudentsByClass = Object.fromEntries(
    Object.entries(studentsByClass).map(([className, students]) => [
      className,
      students.filter(filterByName)
    ])
  )

  // Get class names for tabs
  const roleGroups = Object.keys(studentsByClass)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Siswa dan Pengajar</h1>
          <p className="text-muted-foreground">
            Kelola siswa dan pengajar di semua kelas
          </p>
        </div>
      </div>

      {/* Instructors Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pengajar</CardTitle>
          <CardDescription>
            {filteredInstructors.length} pengajar terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInstructors.length > 0 ? (
              filteredInstructors.map((instructor) => (
                <div 
                  key={instructor.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={instructor.image} alt={instructor.name} />
                      <AvatarFallback>{instructor.name ? instructor.name.charAt(0) : "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{instructor.name}</p>
                      <p className="text-sm text-muted-foreground">{instructor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">Tidak ada pengajar yang ditemukan</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students Section with Tabs for Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Siswa</CardTitle>
          <CardDescription>
            Siswa dikelompokkan berdasarkan kelas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={roleGroups[0]}>
            <TabsList className="mb-4">
              {roleGroups.map((role) => (
                <TabsTrigger key={role} value={role}>
                  {role} ({filteredStudentsByClass[role].length})
                </TabsTrigger>
              ))}
            </TabsList>
            
            {roleGroups.map((role) => (
              <TabsContent key={role} value={role}>
                <div className="space-y-4">
                  {filteredStudentsByClass[role].length > 0 ? (
                    filteredStudentsByClass[role].map((student) => (
                      <div 
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.image} alt={student.name} />
                            <AvatarFallback>{student.name ? student.name.charAt(0) : "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name || "Unnamed Student"}</p>
                            <p className="text-sm text-muted-foreground">{student.email || "No email"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Lihat Profil</DropdownMenuItem>
                              <DropdownMenuItem>Lihat Tugas</DropdownMenuItem>
                              <DropdownMenuItem>Edit Data</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Tidak ada siswa yang ditemukan di kelas {role}</p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}