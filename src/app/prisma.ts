// src/app/prisma.ts
// Pastikan path ini 100% benar mengarah ke output generator Anda
// Dari src/app/prisma.ts ke PROJECT_ROOT/app/generated/prisma/client/
import { PrismaClient as BasePrismaClient } from '@/prisma/app/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// 1. Buat instance klien dasar terlebih dahulu
const basePrismaClient = new BasePrismaClient();

// 2. Perluas dengan Accelerate untuk mendapatkan instance yang akan kita gunakan
const prismaWithAccelerate = basePrismaClient.$extends(withAccelerate());

// 3. Infer (simpulkan) tipe dari klien yang sudah diperluas ini
type ExtendedPrismaClient = typeof prismaWithAccelerate;

// 4. Siapkan objek global untuk caching instance Prisma di mode development
//    Gunakan tipe yang sudah di-infer tadi
const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

// 5. Ekspor instance Prisma
//    Gunakan instance yang sudah ada di global (jika development dan sudah ada),
//    atau gunakan instance prismaWithAccelerate yang baru dibuat.
export const prisma: ExtendedPrismaClient =
  globalForPrisma.prisma || prismaWithAccelerate;

// 6. Di mode development, simpan instance ke global untuk penggunaan berikutnya (mencegah koneksi baru setiap hot-reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}