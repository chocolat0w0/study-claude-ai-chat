import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔌 Testing database connection...');

  try {
    // 接続テスト
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // 簡単なクエリテスト
    const conversationCount = await prisma.conversation.count();
    console.log(`📊 Current conversations: ${conversationCount}`);

    console.log('✅ All database tests passed!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
