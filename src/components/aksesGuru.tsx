// components/AuthNotifier.tsx
"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from "next/navigation"// Import usePathname
import Swal from 'sweetalert2';

export default function AuthNotifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname(); // Untuk mendapatkan path saat ini

  useEffect(() => {
    const toastParam = searchParams.get('toast');

    if (toastParam === 'unauthorized_access') {
      Swal.fire({
        title: 'Akses Ditolak!',
        text: 'hanya guru yang diizinkan untuk mengakses halaman tersebut.',
        icon: 'error',
        confirmButtonText: 'Mengerti',
        customClass: { // Contoh kustomisasi (opsional)
            confirmButton: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        }
      }).then(() => {
        // Opsional: Hapus query parameter dari URL setelah alert ditutup
        // agar tidak muncul lagi saat refresh halaman atau navigasi back/forward.
        // Menggunakan router.replace untuk mengubah URL tanpa menambah history navigasi.
        router.replace(pathname, { scroll: false });
      });
    }
    // Anda bisa menambahkan 'else if' di sini untuk jenis toast lain
    // else if (toastParam === 'login_success') { ... }

  }, [searchParams, router, pathname]); // Tambahkan pathname ke dependency array

  return null; // Komponen ini tidak me-render UI apa pun secara langsung
}