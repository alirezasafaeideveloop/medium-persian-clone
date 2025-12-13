import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      bio?: string;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    bio?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    bio?: string;
  }
}