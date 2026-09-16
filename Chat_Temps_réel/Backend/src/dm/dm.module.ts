import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectConversation } from './entities/direct-conversation.entity';
import { DmService } from './dm.service';
import { DmController } from './dm.controller';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DirectConversation, Room, User]),
    UsersModule,
  ],
  providers: [DmService],
  controllers: [DmController],
  exports: [DmService],
})
export class DmModule {}
