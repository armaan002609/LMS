import { PrismaClient, Prisma } from '@prisma/client';

export * from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Execute database operations inside a tenant context.
 * Enforces PostgreSQL RLS by executing:
 *   SET LOCAL app.organization_id = '<organizationId>'
 * inside a single transaction.
 */
export async function withTenantContext<T>(
  organizationId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Validate UUID format to prevent SQL injection in transaction local setting
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(organizationId)) {
      throw new Error(`Invalid tenant organization UUID: ${organizationId}`);
    }

    // Set PostgreSQL local configuration for RLS
    await tx.$executeRawUnsafe(`SET LOCAL app.organization_id = '${organizationId}'`);

    return fn(tx);
  });
}
