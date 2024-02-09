import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [EventsGateway, EventsService,PrismaService],
})
export class EventsModule {}
