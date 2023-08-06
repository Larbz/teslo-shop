import { JwtPayload } from './../auth/interfaces/jwt-payload.interface';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { CreateMessagesWDto } from './dto/create-messages-w.dto';
import { UpdateMessagesWDto } from './dto/update-messages-w.dto';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
      this.wss.emit(
        'clientsUpdated',
        this.messagesWsService.getConnectedClients(),
      );
    } catch (error) {
      client.disconnect();
      return;
    }

    console.log({ payload });
    // console.log({ conectados: this.messagesWsService.getConnectedClients() });
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit(
      'clientsUpdated',
      this.messagesWsService.getConnectedClients(),
    );
    // console.log({ conectados: this.messagesWsService.getConnectedClients() });
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    // return 'received';
    //EMITIR UNICAMENTE AL CLIENTE
    // client.emit('message-from-server', {
    //   fullName: 'soy yo',
    //   message: payload.message,
    // });

    //EMITIR A TODOS MENOS AL CLIENTE INICIAL
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'soy yo',
    //   message: payload.message,
    // });

    //EMITIR A TODOS
    this.wss.emit('message-from-server', {
      fullName: 'soy yo',
      message: payload.message,
    });
    // console.log(client.id, payload);
  }

  @SubscribeMessage('createMessagesW')
  create(@MessageBody() createMessagesWDto: CreateMessagesWDto) {
    return this.messagesWsService.create(createMessagesWDto);
  }

  @SubscribeMessage('findAllMessagesWs')
  findAll() {
    return this.messagesWsService.findAll();
  }

  @SubscribeMessage('findOneMessagesW')
  findOne(@MessageBody() id: number) {
    return this.messagesWsService.findOne(id);
  }

  @SubscribeMessage('updateMessagesW')
  update(@MessageBody() updateMessagesWDto: UpdateMessagesWDto) {
    return this.messagesWsService.update(
      updateMessagesWDto.id,
      updateMessagesWDto,
    );
  }

  @SubscribeMessage('removeMessagesW')
  remove(@MessageBody() id: number) {
    return this.messagesWsService.remove(id);
  }
}
