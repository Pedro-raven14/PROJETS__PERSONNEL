import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';
import { DmModule } from './dm/dm.module';

import { User } from './users/entities/user.entity';
import { Room } from './rooms/entities/room.entity';
import { Message } from './messages/entities/message.entity';
import { DirectConversation } from './dm/entities/direct-conversation.entity';
import { RoomsService } from './rooms/rooms.service';

const ENTITIES = [User, Room, Message, DirectConversation];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        if (isProd) {
          return {
            type: 'postgres',
            url: config.get('DB_URL'),
            entities: ENTITIES,
            synchronize: true,
            ssl: true,
            extra: { ssl: { rejectUnauthorized: false } },
          };
        }
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', '5432')),
          username: config.get('DB_USER', 'postgres'),
          password: String(config.get('DB_PASSWORD', '')),
          database: config.get('DB_NAME', 'nebula_chat'),
          entities: ENTITIES,
          synchronize: true,
          logging: false,
        };
      },
    }),

    UsersModule,
    AuthModule,
    RoomsModule,
    MessagesModule,
    ChatModule,
    DmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly roomsService: RoomsService) {}

  async onModuleInit() {
    await this.roomsService.seedDefaultRooms();
  }
}
