"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Resolver } from "react-hook-form"
import * as z from "zod"
import { Calendar as  Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Form schemas
const assignmentFormSchema = z.object({
  title: z.string().min(3, {
    message: "Judul tugas harus minimal 3 karakter.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi tugas harus minimal 10 karakter.",
  }),
  courseId: z.string({
    required_error: "Silakan pilih kelas.",
  }),
  dueDate: z.date({
    required_error: "Tanggal pengumpulan harus diisi.",
  }),
  points: z.number().min(0).optional(),
  hasAttachment: z.boolean().default(false),
  files: z.array(z.object({
    url: z.string().url(),
    name: z.string(),
  })).optional(),
})

const announcementFormSchema = z.object({
  title: z.string().min(3, {
    message: "Judul pengumuman harus minimal 3 karakter.",
  }),
  content: z.string().min(10, {
    message: "Isi pengumuman harus minimal 10 karakter.",
  }),
  courseId: z.string({
    required_error: "Silakan pilih kelas.",
  }),
})

const scheduleFormSchema = z.object({
  title: z.string().min(3, {
    message: "Judul jadwal harus minimal 3 karakter.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi jadwal harus minimal 10 karakter.",
  }),
  courseId: z.string({
    required_error: "Silakan pilih kelas.",
  }),
  date: z.date({
    required_error: "Tanggal harus diisi.",
  }),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format waktu harus HH:MM",
  }),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format waktu harus HH:MM",
  }),
})

interface Course {
  id: string
  name: string
}

interface CreateContentPageProps {
  courses: Course[]
}

export default function CreateContentPage({ courses }: CreateContentPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("assignment")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([])
  const [uploadError] = useState<string | null>(null)
  
  const assignmentForm = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema) as unknown as Resolver<z.infer<typeof assignmentFormSchema>>,
    defaultValues: {
      // ... default values seperti yang disarankan di atas
      title: "",
      description: "",
      courseId: undefined, 
      dueDate: undefined,   
      hasAttachment: false,
      points: undefined,
      files: [],
    },
  });

  // Announcement form
  const announcementForm = useForm<z.infer<typeof announcementFormSchema>>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
      courseId: undefined,
    },
  })

  // Schedule form
  const scheduleForm = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "08:00",
      endTime: "09:30",
    },
  })

  // Handle assignment submission
  async function onAssignmentSubmit(values: z.infer<typeof assignmentFormSchema>) {
    setIsSubmitting(true)
    
    try {
      // Send the data to the API
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          courseId: values.courseId,
          dueDate: values.dueDate.toISOString(),
          points: values.points,
          files: values.files || uploadedFiles,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create assignment')
      }
      
      toast("Tugas berhasil dibuat", {
        description: `Tugas ${values.title} telah dibuat dan diterbitkan ke kelas yang dipilih.`,
      })
      
      assignmentForm.reset()
      setUploadedFiles([])
      router.refresh()
    } catch (error) {
      toast.error("Gagal membuat tugas", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat tugas. Silakan coba lagi."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle announcement submission
  async function onAnnouncementSubmit(values: z.infer<typeof announcementFormSchema>) {
    setIsSubmitting(true)
    
    try {
      // Send the data to the API
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          content: values.content,
          courseId: values.courseId,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create announcement')
      }
      
      toast("Pengumuman berhasil dibuat", {
        description: `Pengumuman ${values.title} telah diterbitkan ke kelas yang dipilih.`,
      })
      
      announcementForm.reset()
      router.refresh()
    } catch (error) {
      toast.error("Gagal membuat pengumuman", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pengumuman. Silakan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle schedule submission
  async function onScheduleSubmit(values: z.infer<typeof scheduleFormSchema>) {
    setIsSubmitting(true)
    
    try {
      // Send the data to the API
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          courseId: values.courseId,
          date: values.date.toISOString(),
          startTime: values.startTime,
          endTime: values.endTime,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create schedule')
      }
      
      toast("Jadwal berhasil dibuat", {
        description: `Jadwal ${values.title} telah ditambahkan ke kelas yang dipilih.`,
      })
      
      scheduleForm.reset()
      router.refresh()
    } catch (error) {
      toast.error("Gagal membuat jadwal", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat jadwal. Silakan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const opsiKelasStatis = [
    { value: "TKJ1", label: "TKJ 1" },
    { value: "TKJ2", label: "TKJ 2" },
    { value: "TKJ3", label: "TKJ 3" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buat Konten Pembelajaran</h1>
        <p className="text-muted-foreground">
          Buat dan terbitkan tugas, pengumuman, atau jadwal baru untuk kelas Anda.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignment">Tugas</TabsTrigger>
          <TabsTrigger value="announcement">Pengumuman</TabsTrigger>
          <TabsTrigger value="schedule">Jadwal</TabsTrigger>
        </TabsList>
        
        {/* Assignment Form */}
        <TabsContent value="assignment">
          <Card>
            <CardHeader>
              <CardTitle>Buat Tugas Baru</CardTitle>
              <CardDescription>
                Buat tugas baru untuk siswa yang akan muncul di dashboard dan halaman tugas mereka.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...assignmentForm}>
                <form onSubmit={assignmentForm.handleSubmit(onAssignmentSubmit)} className="space-y-6">
                  <FormField
                    control={assignmentForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Tugas</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan judul tugas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={assignmentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Tugas</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Jelaskan detail tugas yang harus dikerjakan siswa" 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={assignmentForm.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelas</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kelas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {opsiKelasStatis.map((opsi) => (
                                <SelectItem key={opsi.value} value={opsi.value}>
                                {opsi.label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={assignmentForm.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poin Maksimal</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="100" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Biarkan kosong jika tidak menggunakan sistem poin
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={assignmentForm.control}
                      name="hasAttachment"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-3">
                          <div className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Upload Lampiran
                              </FormLabel>
                              <FormDescription>
                                Tambahkan file pendukung untuk tugas ini
                              </FormDescription>
                            </div>
                          </div>
                          
                          {field.value && (
                            <div className="pl-6">
                              {/* This is a simplified file uploader, replace with your actual implementation */}
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm">Upload File</span>
                                </div>
                                <Input 
                                  type="file" 
                                  className="max-w-md" 
                                  onChange={(e) => {
                                    // This is a placeholder for file upload functionality
                                    // In a real implementation, you would handle the file upload
                                    console.log("File selected:", e.target.files)
                                  }}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Format yang didukung: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG (max 10MB)
                                </p>
                              </div>
                              
                              {uploadedFiles.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium mb-2">File yang diupload:</p>
                                  <ul className="text-sm space-y-1">
                                    {uploadedFiles.map((file, index) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <span>{file.name}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {uploadError && (
                                <Alert variant="destructive" className="mt-2">
                                  <AlertDescription>{uploadError}</AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <CardFooter className="px-0 pb-0">
                    <Button type="submit" disabled={isSubmitting} className="ml-auto">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Buat Tugas
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Announcement Form */}
        <TabsContent value="announcement">
          <Card>
            <CardHeader>
              <CardTitle>Buat Pengumuman Baru</CardTitle>
              <CardDescription>
                Buat pengumuman baru untuk memberikan informasi penting kepada seluruh kelas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...announcementForm}>
                <form onSubmit={announcementForm.handleSubmit(onAnnouncementSubmit)} className="space-y-6">
                  <FormField
                    control={announcementForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Pengumuman</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan judul pengumuman" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={announcementForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Isi Pengumuman</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tulis isi pengumuman secara detail" 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={announcementForm.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelas</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kelas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <CardFooter className="px-0 pb-0">
                    <Button type="submit" disabled={isSubmitting} className="ml-auto">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Terbitkan Pengumuman
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Schedule Form */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Buat Jadwal Baru</CardTitle>
              <CardDescription>
                Buat jadwal kegiatan baru seperti pertemuan kelas, ujian, atau kegiatan lainnya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...scheduleForm}>
                <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-6">
                  <FormField
                    control={scheduleForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Kegiatan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan judul kegiatan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={scheduleForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Kegiatan</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Jelaskan detail kegiatan" 
                            className="min-h-24" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={scheduleForm.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelas</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kelas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={scheduleForm.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Mulai</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={scheduleForm.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Selesai</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <CardFooter className="px-0 pb-0">
                    <Button type="submit" disabled={isSubmitting} className="ml-auto">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Tambahkan Jadwal
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}