import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PORT } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // 设置全局前缀
  app.setGlobalPrefix('api');

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('文档管理系统 API')
    .setDescription('文档管理系统的API文档')
    .setVersion('1.0')
    .addTag('files', '文件管理')
    .addTag('build', '构建管理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}`);
  console.log(`WebSocket is available on: ws://localhost:${PORT}`);
  console.log(`Swagger documentation is available at: http://localhost:${PORT}/api/docs`);
}
bootstrap();
