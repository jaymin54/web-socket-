import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}
  async create(createMessageDto: CreateMessageDto, clientId: string) {
    return this.prisma.message.create({
      data: {
        name: createMessageDto.name,
        text: createMessageDto.text,
        clientId: clientId,
      },
    });
  }
  findAll() {
    return `This action returns all message`;
  }


}
