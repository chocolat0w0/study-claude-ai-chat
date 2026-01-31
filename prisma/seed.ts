import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // サンプル会話を作成
  const conversation = await prisma.conversation.create({
    data: {
      title: 'サンプル会話',
      messages: {
        create: [
          {
            role: 'user',
            content: 'こんにちは！TypeScriptについて教えてください。',
          },
          {
            role: 'assistant',
            content:
              'こんにちは！TypeScriptはJavaScriptに静的型付けを追加した言語です。型安全性を保ちながら、大規模なアプリケーション開発を行うことができます。',
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });

  console.log('✅ Created sample conversation:', conversation.id);
  console.log('   Messages:', conversation.messages.length);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
