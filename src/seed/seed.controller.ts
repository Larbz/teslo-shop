import { ApiTags } from '@nestjs/swagger';
import { User } from './../auth/entities/user.entity';
import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(ValidRoles.admin)
  executeSeed() {
    return this.seedService.runSeed();
  }
}
