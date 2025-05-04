"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Image
            src="https://smkn1ru.com/smkn1ramanutara.sch.id/wp-content/uploads/2025/04/Desain-tanpa-judul-11-1024x1024.png"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold tracking-tight">
            Selamat Datang di LMS<br></br> SMKN 1 Raman Utara
          </CardTitle>
          <CardDescription>
            Silahkan login dengan akun Google anda untuk melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 mt-5">
          <button
            onClick={() => signIn("google")}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-black transition-all hover:bg-blue-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
        >
            <Image
            src="https://static.vecteezy.com/system/resources/previews/046/861/647/non_2x/google-logo-transparent-background-free-png.png"
            alt="Google logo"
            width={25}
            height={25}
            />
            <span className="font-medium">Login dengan Google</span>
            <ArrowRight className="ml-auto h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}