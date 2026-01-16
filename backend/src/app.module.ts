import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { BuildModule } from './build/build.module';
import { WsModule } from './ws/ws.module';
import { DIST_DIR } from './common/constants';

@Module({
  imports: [
    FileModule,
    BuildModule,
    WsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', DIST_DIR),
      serveRoot: '/static',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
