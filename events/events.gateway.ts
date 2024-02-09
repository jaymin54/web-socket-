import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Server, Socket } from 'socket.io';
import { Event } from './entities/event.entity';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway {
  static jsonData = {
    person_served: 4,
    userId: 'user123',
    title: 'Classic Spaghetti Carbonara',
    imageUrl: ['spaghetti_carbonara_image.jpg'],
    description:
      'A classic Italian pasta made with eggs, cheese, pancetta, and pepper.',
    total_time: 30,
    no_ingredients: 6,
    food: 'Non-Veg',
    calories: 450,
    fat: 25,
    protein: 20,
    carbs: 40,
    spicy_level: 'Mild',
    cuisine: ['Italian'],
    meals: ['Dinner'],
    directions: {
      container1: {
        time: '30 minutes',
        imageUrl: ['pasta_directions_image.jpg'],
        description:
          'Follow these steps to make delicious spaghetti carbonara.',
        ingredients: [
          {
            name: 'Spaghetti',
            tool: 'Pot',
            measurement: '200g',
          },
          {
            name: 'Eggs',
            tool: 'Bowl',
            measurement: '2',
          },
          {
            name: 'Pancetta or Guanciale',
            tool: 'Pan',
            measurement: '150g',
          },
          {
            name: 'Pecorino Romano Cheese (or Parmesan)',
            tool: 'Grater',
            measurement: '50g',
          },
          {
            name: 'Black Pepper',
            tool: 'Mill',
            measurement: 'to taste',
          },
          {
            name: 'Salt',
            tool: 'N/A',
            measurement: 'to taste',
          },
        ],
        temperature: 'Medium heat',
      },
      container2: {
        time: '5 minutes',
        imageUrl: ['container2_directions_image.jpg'],
        description: 'Another set of directions for the pasta recipe.',
        ingredients: [
          {
            name: 'Ingredient 1 for container 2',
            tool: 'Tool for container 2',
            measurement: 'Amount for container 2',
          },
          {
            name: 'Ingredient 2 for container 2',
            tool: 'Tool for container 2',
            measurement: 'Amount for container 2',
          },
        ],
        temperature: 'Low heat',
      },
    },
  };
  @WebSocketServer()
  server: Server;
  constructor(private readonly eventsService: EventsService) {}

  private deviceSocketMap: { [deviceId: string]: string } = {};

  @SubscribeMessage('sendToDevice')
  async sendToDevice(
    client: Socket,
    data: { deviceId: string; message: string },
  ) {
    // Here you would typically look up the socket ID based on the device ID
    // For the sake of simplicity, let's assume you have a mapping of device IDs to socket IDs
    const deviceId = data.deviceId;
    const socketId = this.deviceSocketMap[deviceId];

    // If the socket ID is found, emit the message to that socket
    if (socketId) {
      this.server.to(socketId).emit('message', data.message);
    }
  }

  // @SubscribeMessage('createEvent')
  // async create(
  //   @MessageBody()
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const eventData = EventsGateway.jsonData;
  //   this.server.emit('message', eventData);
  // }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    console.log('client handshake', client.handshake.query);
    const deviceId = client.handshake.query.deviceId as string;

    if (deviceId) {
      this.saveSocketIdWithDeviceId(deviceId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove device ID mapping on disconnect
    const deviceId = this.getDeviceIdBySocketId(client.id);
    if (deviceId) {
      delete this.deviceSocketMap[deviceId];
    }
  }

  private getDeviceIdBySocketId(socketId: string): string | undefined {
    return Object.keys(this.deviceSocketMap).find(
      (key) => this.deviceSocketMap[key] === socketId,
    );
  }

  saveSocketIdWithDeviceId(deviceId: string, socketId: string) {
    console.log('Saving socket id ', socketId, 'for device Id', deviceId);
    this.deviceSocketMap[deviceId] = socketId;
  }

  @SubscribeMessage('createEvent')
  async create(@MessageBody() data: any) {
    const deviceId = data?.deviceId;
    const eventData = EventsGateway.jsonData;
    console.log('data in createEvent', data);
    console.log("device Id in create event",deviceId)
    console.log("mappings",this.deviceSocketMap)
    const socketId = this.deviceSocketMap[deviceId];
    console.log('deviceId in createEvent', deviceId);
    console.log('socketId in createEvent', socketId);
    if (socketId) {
      this.server.to(socketId).emit('message', eventData);
    } else {
      console.error(`Socket with deviceId ${deviceId} not found.`);
    }
  }

  @SubscribeMessage('findAllEvents')
  findAll() {
    return this.eventsService.findAll();
  }
}
