import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    isAdmin?: boolean;
    isBanned?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      isAdmin?: boolean;
      isBanned?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin?: boolean;
    isBanned?: boolean;
  }
}
