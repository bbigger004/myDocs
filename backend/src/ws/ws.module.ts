import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { BuildModule } from '../build/build.module';

@Module({
  imports: [BuildModule],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WsModule {}
