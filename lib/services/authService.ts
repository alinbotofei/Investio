import { getServerSession } from "next-auth";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const auth = () => getServerSession(handler as any);

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

export async function getSession() {
  return await auth();
}

export async function isAuthenticated() {
  const session = await auth();
  return !!session;
}
