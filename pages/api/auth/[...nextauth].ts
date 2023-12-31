import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/libs/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  //This is a line of code that initializes a new adapter for the Prisma ORM library.
  pages: {
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!user || !user.hashedPassword) {
          throw new Error("User not found");
        }
        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        if (!user.isActived) {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              isActived: true,
            },
          });
        }
        return user;
      },
    }),
  ],

  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 3600,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
