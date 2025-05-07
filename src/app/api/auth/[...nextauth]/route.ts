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
        token.id = user.id;
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
     console.log("JWT CALLBACK --- Final Token being returned:", JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }) {
      console.log("SESSION CALLBACK --- Start");
      console.log("SESSION CALLBACK --- Initial Session:", JSON.stringify(session, null, 2));
      console.log("SESSION CALLBACK --- Token received from JWT callback:", JSON.stringify(token, null, 2));
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
      console.log("SESSION CALLBACK --- Final Session being returned:", JSON.stringify(session, null, 2));
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