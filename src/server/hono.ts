import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { chatRoutes } from './routes/chat';

const app = new Hono().basePath('/api');

// CORS設定
app.use(
  '*',
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// エラーハンドリングミドルウェア
app.onError((err, c) => {
  console.error('API Error:', err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  );
});

// 404ハンドリング
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Routes
app.route('/chat', chatRoutes);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
