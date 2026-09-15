import { PrismaService } from "../../src/_prisma/prisma.service";

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  // onDelete: Cascade sur File.user
  await prisma.user.deleteMany();
}
