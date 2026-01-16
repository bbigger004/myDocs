import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BuildService } from '../build/build.service';
import { BuildTask } from '../build/build.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly buildService: BuildService) {
    // 设置构建完成回调，用于通知客户端
    this.buildService.setOnBuildCompleteCallback((task) => {
      this.emitBuildComplete(task);
    });
  }

  /**
   * 客户端连接事件
   */
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // 发送初始连接确认
    client.emit('connected', { message: 'Connected to WebSocket server' });
  }

  /**
   * 客户端断开连接事件
   */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * 发送构建开始通知
   */
  emitBuildStart(task: BuildTask) {
    this.server.emit('build:start', task);
  }

  /**
   * 发送构建进度更新
   */
  emitBuildProgress(task: BuildTask) {
    this.server.emit('build:progress', task);
  }

  /**
   * 发送构建完成通知
   */
  emitBuildComplete(task: BuildTask) {
    this.server.emit('build:complete', task);
  }

  /**
   * 发送文件变化通知
   */
  emitFileChange(filename: string, action: 'create' | 'update' | 'delete') {
    this.server.emit('file:change', { filename, action });
  }
}
