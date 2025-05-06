import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // <- Import lagi
import { prisma } from "@/app/prisma"; 

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) { 
      const userEmail = user?.email;
      if (!userEmail) {
        console.error("v4 signIn Error: Email tidak ditemukan pada objek user.");
        return false; 
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.role = user.role || "VISITOR";
      }
      if (!token.role && token.email) { // Lookup jika role belum ada
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
        }
     }
      console.log("v4 JWT OK (no DB)");
      return token;
    },
    async session({ session, token }) {
      if (session.user) { 
        if (token.id) { 
          session.user.id = token.id as string;
        }
        if (token.email) {
          session.user.email = token.email as string;
        }
        if (token.role) {
          session.user.role = token.role; // Sesuaikan tipe UserRole jika perlu
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt"},
  events: {
    linkAccount: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        }
      });

      return;
    }
  },
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };