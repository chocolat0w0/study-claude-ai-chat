import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// PrismaClientをモック
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  })),
}));

describe('Prisma Client', () => {
  beforeEach(() => {
    vi.resetModules();
    // globalThisのprismaをクリア
    delete (globalThis as Record<string, unknown>).prisma;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('PrismaClientインスタンスがエクスポートされる', async () => {
    const { prisma } = await import('@/lib/prisma');

    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
  });

  it('開発環境ではglobalThisにキャッシュされる', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { prisma } = await import('@/lib/prisma');

    expect((globalThis as Record<string, unknown>).prisma).toBe(prisma);
  });

  it('本番環境ではglobalThisにキャッシュされない', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    await import('@/lib/prisma');

    expect((globalThis as Record<string, unknown>).prisma).toBeUndefined();
  });

  it('globalThisにキャッシュがあれば再利用される', async () => {
    const mockPrisma = { cached: true };
    (globalThis as Record<string, unknown>).prisma = mockPrisma;

    const { prisma } = await import('@/lib/prisma');

    expect(prisma).toBe(mockPrisma);
  });
});
