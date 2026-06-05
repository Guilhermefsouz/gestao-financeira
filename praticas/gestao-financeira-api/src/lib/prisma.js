import { PrismaClient } from "@prisma/client";

/** Instância única do PrismaClient compartilhada por toda a aplicação. */
export const prisma = new PrismaClient();
