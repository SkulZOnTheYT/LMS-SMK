// src/app/api/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { prisma } from '@/app/prisma'; // Pastikan path ke Prisma Client Anda benar

// Skema payload yang diperbarui untuk mencocokkan data dari frontend
// termasuk detail file dari S3
const assignmentPayloadSchema = z.object({
  title: z.string().min(3, "Judul tugas harus minimal 3 karakter."),
  description: z.string().min(10, "Deskripsi tugas harus minimal 10 karakter."),
  courseId: z.string({ required_error: "Silakan pilih kelas." }), // ID dari tabel Course
  dueDate: z.string().datetime(), // Frontend mengirimkan format ISO string
  points: z.number().min(0).optional(),
  files: z.array(z.object({
    url: z.string().url("URL file S3 tidak valid."),
    name: z.string(),             // Nama file asli
    s3Key: z.string().optional(), // S3 object key
    type: z.string().optional(),  // Tipe MIME
    size: z.number().optional(),  // Ukuran file dalam bytes
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = assignmentPayloadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Input tidak valid", 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { title, description, courseId, dueDate, points } = validation.data;

    // Opsional: Validasi apakah courseId ada di database
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
        dueDate: new Date(dueDate), // Konversi string ISO ke objek Date
        points,
        course: { // Menghubungkan ke Course yang ada
          connect: { id: courseId },
        },
        author: { // Tambahkan author yang valid
          connect: { id: 'author_id_dari_sesi' }, // Ganti dengan ID pengguna yang valid dari sesi
        },
      },
    });

    return NextResponse.json({ 
      message: "Tugas berhasil dibuat dan disimpan ke database.", 
      assignment: newAssignment 
    }, { status: 201 });

  } catch (error) {
    console.error("Gagal membuat tugas di database:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Kesalahan validasi", details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan tugas ke database." }, { status: 500 });
  }
}