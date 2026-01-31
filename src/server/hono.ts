import { Hono } from 'hono';
import { chatRoutes } from './routes/chat';

const app = new Hono().basePath('/api');

// Routes
app.route('/chat', chatRoutes);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;
