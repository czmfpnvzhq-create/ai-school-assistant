import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  app.enableCors({ origin: process.env.FRONTEND_URL ?? '*', credentials: true });
  await app.listen(process.env.PORT ?? 4000);
  // Warm‑up the AI endpoint by sending a minimal request so the model loads once.
  try {
    const warmupUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/api/chat`;
    await fetch(warmupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], className: '' }),
    });
    console.log('🚀 AI warm‑up request sent');
  } catch (e) {
    console.error('⚠️ AI warm‑up failed', e);
  }
}
bootstrap();
