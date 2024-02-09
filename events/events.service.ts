import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {

 
  constructor() {

  }
  // create(createEventDto: CreateEventDto) {
  //   return  EventsService.jsonData;
  // }

  findAll() {
    return `This action returns all events`;
  }
}
