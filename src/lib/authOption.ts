import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import connectToDatabase from "./mongodb";
import User from "../models/User";

type TokenWithMeta = JWT & {
  id?: string;
  provider?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectToDatabase();

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isValidPassword = await user.comparePassword(
            credentials.password,
          );

          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          throw new Error(
            error instanceof Error ? error.message : "Unknown error occurred",
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const typedToken = token as TokenWithMeta;
      if (user) {
        typedToken.id = user.id;
      }
      if (account) {
        typedToken.provider = account.provider;
      }
      return typedToken;
    },
    async session({ session, token }) {
      const typedToken = token as TokenWithMeta;
      if (session.user) {
        session.user.id = typedToken.id || "";
      }
      return session;
    },
    async signIn() {
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
};

export default authOptions;
