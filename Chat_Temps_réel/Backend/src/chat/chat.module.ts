import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { RoomsModule } from '../rooms/rooms.module';
import { AuthModule } from '../auth/auth.module';
import { DmModule } from '../dm/dm.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MessagesModule,
    RoomsModule,
    DmModule,
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
