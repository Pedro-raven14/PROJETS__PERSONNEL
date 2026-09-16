import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { RoomsService } from '../rooms/rooms.service';
import { DmService } from '../dm/dm.service';

/*
  Le Gateway Socket.io est le cœur du chat en temps réel.

  @WebSocketGateway(options) configure le serveur Socket.io :
  - cors : mêmes origines autorisées que le serveur HTTP
  - namespace : "/" par défaut, utile si tu veux segmenter plus tard

  Différence HTTP vs WebSocket :
  - HTTP : client envoie une requête, serveur répond, connexion fermée
  - WebSocket : connexion persistante, les deux côtés peuvent envoyer à tout moment
  C'est ce qui rend le "temps réel" possible sans polling.
*/
@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL_DEV || 'http://localhost:5173',
      process.env.FRONTEND_URL_PROD || '',
    ].filter(Boolean),
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /*
    @WebSocketServer() injecte l'instance du serveur Socket.io.
    On l'utilise pour émettre des événements à tous les clients
    ou à des "rooms" (groupes de sockets).
  */
  @WebSocketServer()
  server: Server;

  /*
    Map socket.id → userId pour retrouver l'utilisateur d'un socket.
    On en a besoin lors de la déconnexion (on reçoit le socket mais pas l'user).
  */
  private socketToUser = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
    private readonly roomsService: RoomsService,
    private readonly dmService: DmService,
  ) {}

  /*
    ──────────────────────────────────────────────
    Cycle de vie : connexion
    ──────────────────────────────────────────────
    Appelé automatiquement quand un client se connecte.
    On vérifie le JWT envoyé dans le handshake (auth.token).
    Si invalide, on déconnecte le socket.
  */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      if (!token) {
        client.disconnect();
        return;
      }

      /*
        jwtService.verify() lève une exception si le token est invalide/expiré.
        On l'utilise ici pour authentifier la connexion WebSocket.
      */
      const payload = this.jwtService.verify<{ sub: string; username: string }>(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        client.disconnect();
        return;
      }

      // Stocker l'association socket <-> user
      this.socketToUser.set(client.id, user.id);

      // Mettre à jour le statut en ligne
      await this.usersService.updateStatus(user.id, 'online');

      // Notifier tous les clients qu'un utilisateur est connecté
      this.server.emit('user:online', {
        userId: user.id,
        username: user.username,
        avatarColor: user.avatarColor,
      });

      console.log(`✅ ${user.username} connecté (socket: ${client.id})`);
    } catch (e) {
      // Token invalide → on déconnecte sans logger l'erreur (bruit normal)
      client.disconnect();
    }
  }

  /*
    ──────────────────────────────────────────────
    Cycle de vie : déconnexion
    ──────────────────────────────────────────────
  */
  async handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    this.socketToUser.delete(client.id);
    await this.usersService.updateStatus(userId, 'offline');

    const user = await this.usersService.findById(userId);
    if (user) {
      this.server.emit('user:offline', { userId, username: user.username });
      console.log(`❌ ${user.username} déconnecté`);
    }
  }

  /*
    ──────────────────────────────────────────────
    Événement : rejoindre un salon
    ──────────────────────────────────────────────
    Socket.io a le concept de "rooms" côté serveur.
    Un socket peut rejoindre plusieurs rooms.
    Quand on émet dans une room, seuls les sockets de cette room reçoivent.

    Payload attendu : { roomId: string }
  */
  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = await this.roomsService.findById(data.roomId);
    if (!room) return;

    // Rejoindre la room Socket.io (par convention on préfixe avec "room:")
    await client.join(`room:${room.id}`);

    // Envoyer l'historique des messages au client qui vient de rejoindre
    const messages = await this.messagesService.findByRoom(room.id, 50);

    // emit() sans broadcast : envoyé UNIQUEMENT au client qui vient de rejoindre
    client.emit('room:history', { roomId: room.id, messages });
  }

  /*
    ──────────────────────────────────────────────
    Événement : quitter un salon
    ──────────────────────────────────────────────
  */
  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    await client.leave(`room:${data.roomId}`);
  }

  /*
    ──────────────────────────────────────────────
    Événement : envoyer un message
    ──────────────────────────────────────────────
    Payload attendu : { roomId: string, content: string }

    Flux :
    1. Valider le contenu
    2. Persister en base
    3. Broadcaster à tous les membres de la room
  */
  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    // Validation basique (plus solide que rien)
    if (!data.content?.trim() || data.content.length > 2000) return;

    const user = await this.usersService.findById(userId);
    const room = await this.roomsService.findById(data.roomId);
    if (!user || !room) return;

    // Persister le message
    const message = await this.messagesService.create(data.content.trim(), user, room);

    /*
      this.server.to('room:roomId').emit() :
      Envoie à TOUS les sockets membres de cette room (y compris l'expéditeur).
      C'est différent de client.broadcast.to() qui exclut l'expéditeur.
      On inclut l'expéditeur pour simplifier la logique côté frontend.
    */
    this.server.to(`room:${room.id}`).emit('message:new', {
      id: message.id,
      content: message.content,
      author: {
        id: user.id,
        username: user.username,
        avatarColor: user.avatarColor,
      },
      roomId: room.id,
      reactions: message.reactions,
      createdAt: message.createdAt,
    });
  }

  /*
    ──────────────────────────────────────────────
    Événement : indicateur "en train d'écrire"
    ──────────────────────────────────────────────
    Payload : { roomId: string, isTyping: boolean }

    On broadcast à TOUS sauf l'expéditeur (c'est lui qui tape, pas besoin de se notifier lui-même).
  */
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const user = await this.usersService.findById(userId);
    if (!user) return;

    // broadcast = envoie à tous SAUF l'expéditeur
    client.broadcast.to(`room:${data.roomId}`).emit('typing', {
      userId,
      username: user.username,
      isTyping: data.isTyping,
    });
  }

  /*
    ──────────────────────────────────────────────
    Événement : réaction à un message
    ──────────────────────────────────────────────
    Payload : { messageId: string, emoji: string, roomId: string }
  */
  @SubscribeMessage('message:react')
  async handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; emoji: string; roomId: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const user = await this.usersService.findById(userId);
    if (!user) return;

    const message = await this.messagesService.toggleReaction(data.messageId, data.emoji, user);

    // Diffuser la mise à jour des réactions à tout le salon
    this.server.to(`room:${data.roomId}`).emit('message:updated', {
      id: message.id,
      reactions: message.reactions,
    });
  }

  /*
    ──────────────────────────────────────────────
    Événement : créer un salon via WebSocket
    ──────────────────────────────────────────────
    Payload : { name: string, description?: string, isPrivate?: boolean }
    
    On notifie TOUS les clients connectés qu'un nouveau salon existe.
  */
  @SubscribeMessage('room:create')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { name: string; description?: string; isPrivate?: boolean },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const user = await this.usersService.findById(userId);
    if (!user) return;

    try {
      const room = await this.roomsService.create(
        { name: data.name, description: data.description, isPrivate: data.isPrivate ?? false },
        user,
      );
      this.server.emit('room:created', room);
    } catch (e) {
      client.emit('room:error', { message: e.message });
    }
  }

  /*
    ──────────────────────────────────────────────
    Événement : envoyer un message direct (DM)
    ──────────────────────────────────────────────
    Payload : { convId: string, content: string }

    Flux :
    1. Charger la DirectConversation
    2. Si pas encore de Room → en créer une (premier message)
    3. Faire rejoindre les deux users la room Socket.io
    4. Persister le message
    5. Broadcaster dans la room

    Pourquoi gérer ça séparément de message:send ?
    Parce que dm:send a une logique de création lazy de la room
    qui n'existe pas pour les salons normaux.
  */
  @SubscribeMessage('dm:send')
  async handleDmSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { convId: string; content: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;
    if (!data.content?.trim() || data.content.length > 2000) return;

    const user = await this.usersService.findById(userId);
    const conv = await this.dmService.findById(data.convId);
    if (!user || !conv) return;

    // Créer la room si c'est le premier message
    let room = conv.room;
    if (!room) {
      room = await this.dmService.createRoomForConversation(conv);

      /*
        Faire rejoindre les deux participants à la room Socket.io.
        On cherche les sockets des deux users via la Map socketToUser.
      */
      const roomKey = `room:${room.id}`;
      for (const [socketId, uid] of this.socketToUser.entries()) {
        if (uid === conv.user1.id || uid === conv.user2.id) {
          const socket = this.server.sockets.sockets.get(socketId);
          socket?.join(roomKey);
        }
      }

      // Notifier les deux participants qu'une nouvelle conversation DM est ouverte
      this.server.to(`room:${room.id}`).emit('dm:room_created', {
        convId: conv.id,
        room: {
          id: room.id,
          name: room.name,
          isDm: true,
        },
        participants: [
          { id: conv.user1.id, username: conv.user1.username, avatarColor: conv.user1.avatarColor },
          { id: conv.user2.id, username: conv.user2.username, avatarColor: conv.user2.avatarColor },
        ],
      });
    }

    // Persister et broadcaster le message
    const message = await this.messagesService.create(data.content.trim(), user, room);

    this.server.to(`room:${room.id}`).emit('message:new', {
      id: message.id,
      content: message.content,
      author: { id: user.id, username: user.username, avatarColor: user.avatarColor },
      roomId: room.id,
      reactions: message.reactions,
      createdAt: message.createdAt,
    });
  }

  /*
    ──────────────────────────────────────────────
    Événement : rejoindre une room DM existante
    ──────────────────────────────────────────────
    Appelé quand l'user ouvre une conversation qui a déjà une room.
  */
  @SubscribeMessage('dm:join')
  async handleDmJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { convId: string },
  ) {
    const conv = await this.dmService.findById(data.convId);
    if (!conv?.room) return; // Pas encore de room = pas de messages

    await client.join(`room:${conv.room.id}`);
    const messages = await this.messagesService.findByRoom(conv.room.id, 50);
    client.emit('room:history', { roomId: conv.room.id, messages });
  }
}
