// updateUserRole.js
import { PrismaClient, UserRole } from './src/prisma/app/generated/prisma/client/index.js'; // Sesuaikan path ke client Anda

// Inisialisasi Prisma Client. Pastikan DATABASE_URL di .env menunjuk ke database langsung
// atau ke URL Accelerate jika Anda memang sedang menguji Accelerate.
// Untuk debug masalah enum seperti ini, koneksi langsung seringkali lebih baik.
const prisma = new PrismaClient();

async function main() {
  const userIdToUpdate = 'cmakg71q90000i60v0bznfaqq'; // Ganti dengan ID user yang bermasalah
  const newRoleToSet = UserRole.TKJ1; // Ganti dengan salah satu role dari enum Anda

  console.log(`Mencoba update user ID: ${userIdToUpdate} ke role: ${newRoleToSet}`);

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userIdToUpdate,
      },
      data: {
        role: newRoleToSet, // Menggunakan nilai dari enum yang diimpor
      },
    });
    console.log('User berhasil diupdate:', updatedUser);
  } catch (error) {
    console.error('Error saat update role user:', error); // Perhatikan detail error di sini!
  } finally {
    await prisma.$disconnect();
  }
}

main();