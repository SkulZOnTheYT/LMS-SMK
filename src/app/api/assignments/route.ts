// src/app/api/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { prisma } from '@/app/prisma'; // Sekarang ini seharusnya mengimpor instance yang sudah diperbaiki
import { getServerSession } from "next-auth"; // Jika Anda menggunakan NextAuth

// Definisikan enum UserRole untuk validasi Zod, harus sinkron dengan Prisma
const UserRoleZodEnum = z.enum(["VISITOR", "TKJ1", "TKJ2", "TKJ3", "INSTRUCTOR"]);

const assignmentPayloadSchema = z.object({
  title: z.string().min(1, "Judul tugas tidak boleh kosong."),
  description: z.string().optional(),
  courseId: z.string().cuid("Format ID kelas tidak valid."),
  dueDate: z.string().datetime("Format tanggal pengumpulan tidak valid."),
  points: z.number().int().min(0).optional(),
  files: z.array(z.object({
    url: z.string().url("URL file tidak valid."), // Nanti akan jadi URL S3 atau placeholder
    name: z.string(),
    s3Key: z.string().optional(),
    type: z.string().optional(),
    size: z.number().optional(),
  })).optional(),
  targetKelas: UserRoleZodEnum.optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(); // Dapatkan sesi pengguna

  if (!session || !session.user) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
      where: { email: session.user.email ?? undefined },
      select: {
        id: true,
        role: true,
      },
    })

  const authorId = session.user.id;
  if (!user || user.role !== "INSTRUCTOR") { // Asumsikan UserRole ada di tipe session.user
    console.log(`Autorisasi gagal: User role adalah '${user?.role}', bukan INSTRUCTOR.`);
    return NextResponse.json({ error: "Anda tidak diizinkan membuat tugas." }, { status: 403 }); 
  }

  try {
    const body = await req.json();
    const validation = assignmentPayloadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: "Input tidak valid",
        details: validation.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { title, description, courseId, dueDate, points, files, targetKelas } = validation.data;

    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!courseExists) {
      return NextResponse.json({ error: `Kelas dengan ID '${courseId}' tidak ditemukan.` }, { status: 404 });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        points,
        files: files && files.length > 0 ? files : undefined, // Simpan array file sebagai JSON
        targetKelas,
        course: { connect: { id: courseId } },
        author: { connect: { id: authorId } }, // Gunakan authorId dari sesi
      },
      include: {
        author: { select: { id:true, name: true } },
        course: { select: { id:true, name: true } },
      }
    });

    return NextResponse.json({
      message: "Tugas berhasil dibuat.",
      assignment: newAssignment
    }, { status: 201 });

  } catch (error) {
    console.error("Gagal membuat tugas di database:", error);
    return NextResponse.json({ error: "Gagal menyimpan tugas ke database." }, { status: 500 });
  }
}